import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen 
        name="onboarding" 
        options={{
          animation: 'fade_from_bottom',
        }}
      />
      <Stack.Screen 
        name="login" 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="signup" 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="reset-password" 
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
