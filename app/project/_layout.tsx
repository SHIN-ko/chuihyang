import { Stack } from 'expo-router';

export default function ProjectLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen 
        name="create" 
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="[id]" 
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
