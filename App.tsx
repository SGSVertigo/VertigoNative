/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import BtControls from './BtControls';
import { Provider as PaperProvider } from 'react-native-paper';



declare const global: {HermesInternal: null | {}};


const App = () => {
  return (
    <PaperProvider>
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic">
         
          <View>
            <View>
              <BtControls></BtControls>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
    </PaperProvider>
  );
};


export default App;
