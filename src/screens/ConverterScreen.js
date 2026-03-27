import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import RNImageToPdf from 'react-native-image-to-pdf';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import AdMobNativeBanner from '../components/AdMobNativeBanner';
import { ScaledSheet } from 'react-native-size-matters';

const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy';
let rewardedAd = null;

export default function ConverterScreen() {
  const [loaded, setLoaded] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    let unsubscribeLoaded = () => {};
    let unsubscribeEarned = () => {};
    let unsubscribeClosed = () => {};
    let unsubscribeError = () => {};

    const loadAd = () => {
      try {
        rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true,
        });

        unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
          setLoaded(true);
        });

        unsubscribeEarned = rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          reward => {
            // Only generate PDF after reward verified
            generatePdf();
          },
        );

        unsubscribeClosed = rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
          setLoaded(false);
          // Reload ad strictly after closed
          loadAd();
        });

        unsubscribeError = rewardedAd.addAdEventListener(RewardedAdEventType.ERROR, (error) => {
           console.error('Ad Error', error);
           setLoaded(false);
           // Optionally retry or just wait for user action
        });

        rewardedAd.load();
      } catch(e) {
        console.error("Ad load exception", e);
        setLoaded(false);
      }
    };

    loadAd();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const handleConvertPress = () => {
    if (loaded && rewardedAd) {
      try {
        rewardedAd.show();
      } catch (e) {
        console.error("Ad show exception", e);
        Alert.alert("Ad Error", "Failed to display ad due to a network or loading error.");
        setLoaded(false);
      }
    } else {
      Alert.alert('Ad Not Ready', 'Please connect to the internet and wait for the ad to load.');
    }
  };

  const generatePdf = async () => {
    setConverting(true);
    try {
      // Logic using react-native-image-to-pdf
      const options = {
        imagePaths: [], // Placeholder for actual image paths from device
        name: 'converted_doc.pdf',
        maxSize: {
          width: 900,
          height: Math.round(900 / 1.414),
        },
        quality: 0.7,
      };
      
      // const pdf = await RNImageToPdf.createPDFbyImages(options);
      Alert.alert('Success', 'Image to PDF conversion logic reached successfully.');
    } catch (e) {
      console.error("PDF Generation error", e);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setConverting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image to PDF Converter</Text>
      
      {converting ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.buttonContainer}>
          <Button 
            title={loaded ? "Convert to PDF (Watch Ad)" : "Loading Ad..."}
            onPress={handleConvertPress}
            disabled={!loaded}
          />
        </View>
      )}

      <View style={styles.bannerContainer}>
        <AdMobNativeBanner />
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20@ms',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: '20@ms0.3',
    fontWeight: 'bold',
    marginBottom: '30@mvs',
  },
  buttonContainer: {
    marginBottom: '50@mvs',
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  }
});
