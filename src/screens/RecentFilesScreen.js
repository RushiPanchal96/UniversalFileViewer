import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import RNFS from 'react-native-fs';
import { ScaledSheet } from 'react-native-size-matters';

export default function RecentFilesScreen() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const scanFiles = async () => {
    try {
      setLoading(true);
      const dirPath = RNFS.DownloadDirectoryPath;
      if (!dirPath) {
        setLoading(false);
        return;
      }
      const result = await RNFS.readDir(dirPath);
      
      const filteredFiles = result.filter(f => 
        f.isFile() && 
        (f.name.endsWith('.pdf') || f.name.endsWith('.jpg') || f.name.endsWith('.zip'))
      );

      setFiles(filteredFiles);
    } catch (error) {
      console.warn('Error scanning files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanFiles();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">{item.name}</Text>
      <Text style={styles.fileSize}>{(item.size / 1024).toFixed(2)} KB</Text>
      <Text style={styles.filePath} numberOfLines={1} ellipsizeMode="tail">{item.path}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.path}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No files found in Downloads</Text>}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemContainer: { padding: '15@ms', borderBottomWidth: 1, borderColor: '#eee' },
  fileName: { fontSize: '16@ms0.3', fontWeight: '500', color: '#333' },
  fileSize: { fontSize: '13@ms0.3', color: '#666', marginTop: '4@mvs' },
  filePath: { fontSize: '11@ms0.3', color: '#999', marginTop: '2@mvs' },
  emptyText: { textAlign: 'center', marginTop: '50@mvs', fontSize: '16@ms0.3', color: '#999' }
});
