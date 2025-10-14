<template>
  <n-config-provider
    :theme="naiveTheme"
    :theme-overrides="themeOverrides"
    class="h-full"
  >
    <n-global-style />
    <n-dialog-provider>
      <n-notification-provider>
        <n-message-provider>
          <slot></slot>
        </n-message-provider>
      </n-notification-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>
<script setup lang="ts">
import {
  NConfigProvider,
  NDialogProvider,
  NNotificationProvider,
  NMessageProvider,
  NGlobalStyle,
  type GlobalThemeOverrides,
} from 'naive-ui';
import { computed } from 'vue';
import { useTheme } from '@app/composables/use-theme';

const { naiveTheme } = useTheme();
const themeOverrides = computed<GlobalThemeOverrides>(() => ({
  common: {
    primaryColor: '#3498db',
    primaryColorHover: '#5dade2',
    primaryColorPressed: '#217dbb',
    primaryColorSuppl: '#3498db',
  },
}));
</script>
