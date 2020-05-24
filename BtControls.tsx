import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableHighlight } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

type BluetoothProps = {

}

const vertigoDataServiceId: string = "d7a7fc0a-b32e-4bda-933f-49cbd9cfe2dc";
const vertigoHardwareServiceId: string = "0000180a-0000-1000-8000-00805f9b34fb";

export default class BtControls extends Component<BluetoothProps> {

    manager: BleManager;
    devices: Device[] = [];
    state = {
        scanning: false,
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

    connect(device: Device) {
        device.connect()
            .then((device) => {
                return device.discoverAllServicesAndCharacteristics()
            })
            .then((device) => {
                // Do work on device with services and characteristics
            })
            .catch((error) => {
                // Handle errors
            });
    }

    private getLoggingStatus(): string {
        if (!this.state.bluetoothReady) return "Bluetooth disabled";
        if (this.state.scanning) return "Scanning";
        return "Scan";
    }

    render() {
        return (
            <View>
                <Button title={this.getLoggingStatus()} disabled={!this.state.bluetoothReady} onPress={this.toggleLogging.bind(this)}></Button>
                <FlatList
                    data={this.state.devices}
                    renderItem={({ item }) => <TouchableHighlight onPress={(e) => this.connect(item)} key={item.id}>
                        <View>
                            <View>
                                <Text >{item.name}</Text>
                                <Text >{item.id}</Text>
                            </View>
                        </View>

                    </TouchableHighlight>
                    }
                />
            </View>

        );
    }

    componentWillUnmount() {
        this.manager.destroy();
    }



}


