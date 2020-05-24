import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableHighlight } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { List, Appbar } from 'react-native-paper';
import App from 'App';

type BluetoothProps = {

}

const vertigoDataServiceId: string = "d7a7fc0a-b32e-4bda-933f-49cbd9cfe2dc";
const vertigoHardwareServiceId: string = "0000180a-0000-1000-8000-00805f9b34fb";
//Serial Number
const serialNumberCharateristicID: string = '00002a25-0000-1000-8000-00805f9b34fb';
//Firmware version 
const firwareRevisionCharateristicID: string = '00002a26-0000-1000-8000-00805f9b34fb';
// Altitude & Heading Reference System (“AHRS”)
const imuQuaternionCharacteristicID: string = '45ae0807-2233-4026-b264-045a933fa973';
// Magnetometer/Accelerometer/Rate Gyro (“MARG”)
const magnetometerCharacteristicID: string = '45ae0807-2233-4026-b264-045a933fa974';
// Atmospheric / Ambient sensors (“ATMO”)
const atmosphericCharacteristicID: string = '45ae0807-2233-4026-b264-045a933fa975';
// Global Navigation Satellite System (“GNSS”)
const gpsCharacteristicID: string = 'f078622c-f2ee-4adb-896f-cef6645e1521';
// STATUS (“STAT”)
const statusCharacteristicID: string = 'c70617b6-993d-481f-b02a-7fcfbb3d2133';
// CONTROL (“CTRL”)
const controlCharacteristicID: string = 'c771b990-055f-11e9-8eb2-f2801f1b9fd1';

export default class BtControls extends Component<BluetoothProps> {

    manager: BleManager;
    devices: Device[] = [];
    selectedDevice: Device | null = null;
    state = {
        selectedDevice: this.selectedDevice,
        scanning: false,
        logging: false,
        bluetoothReady: false,
        manager: null,
        devices: this.devices
    };

    constructor(props: BluetoothProps) {
        super(props);
        this.manager = new BleManager();
    }



    private toggleLogging() {
        if (this.state.scanning) {
            this.manager.stopDeviceScan();
            this.setState({
                scanning: false
            });
        } else {
            this.scan();
        }
    }

    componentWillMount() {
        this.manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                this.setState({
                    bluetoothReady: true
                })
            } else {
                this.setState({
                    bluetoothReady: false
                });
            }
        }, true);
    }

    scan() {
        this.setState({
            scanning: true,
            devices: []
        })
        this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically
                console.error(error.message);
                return
            }
            if (device) {
                if (!this.state.devices.some(d => d.id === device.id)) {
                    this.setState({ devices: this.state.devices.concat([device]) });
                }
            }
        });
    }

    selectDevice(device: Device) {
        this.manager.stopDeviceScan();
        this.setState({
            scanning: false,
            selectedDevice: device
        });
    }

    private getLoggingStatus(): string {
        if (!this.state.bluetoothReady) return "Bluetooth disabled";
        if (this.state.scanning) return "Scanning";
        return "Scan";
    }

    private getScanScreen() {
        return (<View>
            <Button title={this.getLoggingStatus()} disabled={!this.state.bluetoothReady} onPress={this.toggleLogging.bind(this)}></Button>
            <FlatList
                data={this.state.devices}
                renderItem={({ item }) => <TouchableHighlight onPress={(e) => this.selectDevice(item)} key={item.id}>
                    <List.Item
                        title={item.name ? item.name : "Unknown Device"}
                        description={item.id}
                        left={props => <List.Icon {...props} icon="bluetooth" />}
                    />

                </TouchableHighlight>
                }
            />
        </View>);
    }

    private getDevice() {
        return (<View>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => this.back()} />
                <Appbar.Content title={this.state.selectedDevice?.name} subtitle={this.state.selectedDevice?.id} />
            </Appbar.Header>
            <Button title="Connect" onPress={this.connect.bind(this)}></Button>
            <Button title="Start Logging" onPress={() => this.startLogging()}></Button>
            <Button title="Stop Logging" onPress={() => this.stopLogging()}></Button>
            <Button title="Calibrate" onPress={() => this.stopLogging()}></Button>
        </View>);
    }

    back() {
        this.setState({
            selectedDevice: null
        });
    }

    render() {
        return (

            <View>

                {this.state.selectedDevice ? this.getDevice() : this.getScanScreen()}
            </View>

        );
    }

    componentWillUnmount() {
        this.manager.destroy();
    }

    public connect() {
        if (this.state.selectedDevice){
            this.manager.destroy();
            this.manager = new BleManager();
            console.debug("Connecting");
            this.selectedDevice?.connect()
                .then((device) => {
                    console.debug("Connected");
                    return device.discoverAllServicesAndCharacteristics()
                })
                .then((device) => {
                // Do work on device with services and characteristics
                })
                .catch((error) => {
                    console.debug("Error");
                    console.error(error.message)
                });
        }
        
    }

    public startLogging() {
        this.setState({
            logging: true
        });
        if (this.state.selectedDevice?.isConnected()) {
            console.debug("Is connected Connected");
            //this.manager.writeCharacteristicWithoutResponseForDevice(this.state.selectedDevice.id,vertigoDataServiceId,controlCharacteristicID,"AQ==").catch(error=>console.error(error));
            this.state.selectedDevice?.writeCharacteristicWithoutResponseForService(vertigoDataServiceId,controlCharacteristicID,"AQ==").catch(error=>console.error(error));
        } else {
            console.error("Not connected");
        }
    }


    public stopLogging() {
        this.setState({
            logging: false
        });
        if (this.state.selectedDevice?.isConnected()) {
            this.state.selectedDevice?.writeCharacteristicWithoutResponseForService(vertigoDataServiceId,controlCharacteristicID,"Ag==").catch(error=>console.error(error));
        }
    }

    public calibrate() {
        if (this.state.selectedDevice?.isConnected()) {
            this.state.selectedDevice?.writeCharacteristicWithoutResponseForService(vertigoDataServiceId,controlCharacteristicID,"CA==").catch(error=>console.error(error));
        }
    }



}


