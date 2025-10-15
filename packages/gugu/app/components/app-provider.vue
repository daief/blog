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
    primaryColor: '#f97316',
    primaryColorHover: '#fb923c',
    primaryColorPressed: '#ea580c',
    primaryColorSuppl: '#f97316',
  },
}));
</script>
