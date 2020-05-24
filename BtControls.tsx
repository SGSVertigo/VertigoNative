import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

type BluetoothProps = {

  }

const vertigoDataServiceId:string = "d7a7fc0a-b32e-4bda-933f-49cbd9cfe2dc";
const vertigoHardwareServiceId:string = "0000180a-0000-1000-8000-00805f9b34fb";

export default class BtControls extends Component<BluetoothProps> {

    manager:BleManager;
    state = {
        logging:false,
        bluetoothReady:false,
        manager:null,
        deviceFound:""
    };

    constructor(props: BluetoothProps){
        super(props);
        this.manager = new BleManager();
    }

    

    private startLogging(){
        this.setState({
            "logging":true
        });
    }

    componentWillMount() {
        const subscription = this.manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                this.scanAndConnect();
                this.setState({
                    bluetoothReady:true
                })
                subscription.remove();
            }
        }, true);
    }

    scanAndConnect() {
        this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                return
            }
            if (device) console.debug("Name:"+device.name);
            if (device) device.serviceUUIDs?.forEach(u=>console.debug("UUID:"+u));
            // Check if it is a device you are looking for based on advertisement data
            // or other criteria.
            if (device && device.serviceUUIDs?.some(s=>s==vertigoDataServiceId)) {
                console.debug("Found");
                this.setState({
                    deviceFound:device.name
                })
                // Stop scanning as it's not necessary if you are scanning for one device.
                this.manager.stopDeviceScan();
    
                // Proceed with connection.
                this.connect(device);
            }
        });
    }

    connect(device:Device){
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

    render(){
        const name = this.state.logging?"Hello, I am logging":"Hello, I am not logging";
        
        return (
            <View style={styles.container}>
                <Button title={name} onPress={this.startLogging.bind(this)}></Button>
            </View>
    
        );
    }

    componentWillUnmount(){
        this.manager.destroy();
    }
    
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  
