import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-lg font-bold">OS {id}</Text>
    </View>
  );
}
