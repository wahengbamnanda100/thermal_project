// App.js
import React from "react";
import {
	Printer,
	Text,
	Cut,
	render, // This function renders the receipt to a Uint8Array (ESC/POS commands)
} from "react-thermal-printer";

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

			// Request the USB device with the appropriate filter
			// Replace vendorId and productId with your printer's values.
			const device = await navigator.usb.requestDevice({ filters: [] });

			console.log({ device });

			// Open the device
			await device.open();
			// If the device is not already configured, select configuration 1
			if (device.configuration === null) {
				await device.selectConfiguration(1);
			}
			// Claim interface 0 (update if your printer uses a different interface)
			await device.claimInterface(0);

			// Transfer the print data to the printer.
			// Endpoint number 1 is typical for OUT transfers but verify with your device.
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
