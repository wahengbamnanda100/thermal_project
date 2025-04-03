// App.js
import React from "react";
import {
	Printer,
	Text,
	Cut,
	render, // Renders the receipt to a Uint8Array (ESC/POS commands)
} from "react-thermal-printer";

// Helper functions to get and save printer info in localStorage
const getSavedDeviceInfo = () => {
	const saved = localStorage.getItem("usbPrinterInfo");
	return saved ? JSON.parse(saved) : null;
};

const saveDeviceInfo = (device) => {
	// Extract vendorId, productId, and serialNumber (if provided)
	const info = {
		vendorId: device.vendorId,
		productId: device.productId,
		serialNumber: device.serialNumber || null,
	};
	localStorage.setItem("usbPrinterInfo", JSON.stringify(info));
};

const connectToSavedDevice = async (savedInfo) => {
	// Get all USB devices already granted access
	const devices = await navigator.usb.getDevices();
	// Return the device that matches the stored info
	return devices.find(
		(device) =>
			device.vendorId === savedInfo.vendorId &&
			device.productId === savedInfo.productId &&
			device.serialNumber === savedInfo.serialNumber
	);
};

function App() {
	const handlePrint = async () => {
		// Create the receipt using React components
		const receipt = (
			<Printer type="epson" width={42}>
				<Text size={{ width: 2, height: 2 }}>Hello Thermal Printer!</Text>
				<Text bold={true}>This is a test receipt.</Text>
				<Cut />
			</Printer>
		);

		try {
			// Convert the receipt JSX to ESC/POS command data
			const data = await render(receipt);

			let device;
			// Try to reconnect with saved device info
			const savedInfo = getSavedDeviceInfo();
			if (savedInfo) {
				device = await connectToSavedDevice(savedInfo);
			}

			// If no device is found from saved info, prompt the user
			if (!device) {
				device = await navigator.usb.requestDevice({ filters: [] });
				// Save device info for future use
				console.log({ device });
				saveDeviceInfo(device);
			}

			console.log({ device });

			// Open the device
			await device.open();
			// If the device is not configured, select configuration 1
			if (device.configuration === null) {
				await device.selectConfiguration(1);
			}
			// Claim interface 0 (update if your printer uses a different interface)
			await device.claimInterface(0);

			// Send the print data to the printer (endpoint 1 typical for OUT transfers)
			const result = await device.transferOut(1, data);
			if (result.status === "ok") {
				alert("Print job sent successfully!");
			} else {
				alert("Print job failed: " + result.status);
			}
		} catch (error) {
			console.error("Error printing receipt:", error);
			alert("Failed to print. See console for details.");
		}
	};

	return (
		<div style={{ padding: 20 }}>
			<h1>Thermal Printer Demo</h1>
			<button onClick={handlePrint}>Print Receipt</button>
		</div>
	);
}

export default App;
