import React, { useState, useEffect } from "react";
import { Printer, Text, Cut, render } from "react-thermal-printer";

function App() {
	const [ports, setPorts] = useState([]);
	const [selectedPort, setSelectedPort] = useState(null);
	const [printing, setPrinting] = useState(false);

	// Check for available serial ports when component mounts
	useEffect(() => {
		if ("serial" in navigator) {
			// If browser supports Web Serial API, get ports
			listAvailablePorts();
		}
	}, []);

	// Function to list available serial ports
	const listAvailablePorts = async () => {
		try {
			// Get ports the user has previously granted access to
			const ports = await navigator.serial.getPorts();
			setPorts(ports);
		} catch (error) {
			console.error("Error getting serial ports:", error);
		}
	};

	// Function to request access to a new port
	const requestPort = async () => {
		try {
			const port = await navigator.serial.requestPort();
			setPorts((prev) => [...prev, port]);
			setSelectedPort(port);
			return port;
		} catch (error) {
			console.error("Error requesting serial port:", error);
			return null;
		}
	};

	// Function to send data to the printer via serial port
	const sendToPrinter = async (port, data) => {
		try {
			// Open the port with appropriate settings for your printer
			// These settings vary by printer model - check your documentation
			await port.open({ baudRate: 9600 });

			// Create a writer to send data
			const writer = port.writable.getWriter();

			// Convert Uint8Array to proper format and send
			await writer.write(data);

			// Release the writer and close the port
			writer.releaseLock();
			await port.close();

			return true;
		} catch (error) {
			console.error("Error sending to printer:", error);
			return false;
		}
	};

	const handlePrint = async () => {
		setPrinting(true);

		try {
			// Create the receipt using React components
			const receipt = (
				<Printer type="epson" width={42}>
					<Text size={{ width: 2, height: 2 }}>Hello Thermal Printer!</Text>
					<Text bold={true}>This is a test receipt.</Text>
					<Cut />
				</Printer>
			);

			// Convert the receipt JSX to ESC/POS command data
			const data = await render(receipt);

			// Get the port to use
			let port = selectedPort;

			// If no port is selected, try to get one
			if (!port) {
				if (ports.length > 0) {
					port = ports[0];
					setSelectedPort(port);
				} else {
					// Request user to select a port
					port = await requestPort();
					if (!port) {
						throw new Error("No serial port selected");
					}
				}
			}

			// Send the data to the printer
			const success = await sendToPrinter(port, data);

			if (success) {
				alert("Print job sent successfully!");
			} else {
				alert("Print job failed");
			}
		} catch (error) {
			console.error("Error printing receipt:", error);
			alert("Failed to print: " + error.message);
		} finally {
			setPrinting(false);
		}
	};

	return (
		<div style={{ padding: 20 }}>
			<h1>Thermal Printer Demo (Serial Port)</h1>

			<div style={{ marginBottom: 20 }}>
				<button onClick={requestPort}>Select Serial Port</button>
				{selectedPort && (
					<p>
						Port selected:{" "}
						{selectedPort.getInfo().usbProductId || "Serial Port"}
					</p>
				)}
			</div>

			<button onClick={handlePrint} disabled={printing}>
				{printing ? "Printing..." : "Print Receipt"}
			</button>
		</div>
	);
}

export default App;
