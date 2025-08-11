<template>
  <UCol justify="center" align="center" block class="bg-default lg:min-h-screen">
    <UCol align="center" gap="xl" class="lg:py-8">
      <UBadge
        size="lg"
        variant="subtle"
        color="neutral"
        round
        class="font-medium py-1.5 text-small md:text-medium"
        :class="!version && 'animate-pulse'"
      >
        {{ $t("badge.releaseText", { version: version || "1.X.X" }) }}
      </UBadge>

      <URow align="center" gap="none" class="relative">
        <UIcon :src="VuelessOuter" alt="Vueless UI" class="size-16 mr-1" color="success" />
        <UIcon :src="VuelessInner" alt="Vueless UI" class="size-8 absolute left-6" />

        <UHeader :label="$t('title.vueless')" size="2xl" class="text-nowrap" weight="bold" />
      </URow>

      <UText
        :label="$t('title.yourVuelessApp')"
        align="center"
        size="lg"
        variant="lifted"
        weight="medium"
        class="whitespace-break-spaces"
      />
    </UCol>

    <URow justify="between" align="stretch" gap="xl" block class="max-w-5xl">
      <ULink href="https://docs.vueless.com/" target="_blank">
        <UCard variant="outlined" class="flex items-center hover:bg-primary/2">
          <URow gap="sm" block>
            <UIcon name="docs" color="success" size="md" class="-mt-1" />

            <UCol gap="sm">
              <UText :label="$t('label.docs')" size="lg" weight="semibold" />
              <UText :label="$t('description.docs')" variant="lifted" class="leading-normal" />
            </UCol>
          </URow>
        </UCard>
      </ULink>

      <ULink href="https://ui.vueless.com" target="_blank">
        <UCard variant="outlined" class="flex items-center hover:bg-primary/2">
          <URow gap="sm" block>
            <UIcon name="category" color="success" size="md" class="-mt-1" />

            <UCol gap="sm">
              <UText :label="$t('label.components')" size="lg" weight="semibold" />
              <UText
                :label="$t('description.components')"
                variant="lifted"
                class="leading-normal"
              />
            </UCol>
          </URow>
        </UCard>
      </ULink>

      <ULink href="https://github.com/vuelessjs/vueless" target="_blank">
        <UCard variant="outlined" class="flex items-center hover:bg-primary/2">
          <URow gap="sm" block>
            <UIcon name="star" color="success" size="md" class="-mt-1" />

            <UCol gap="sm">
              <UText :label="$t('label.star')" size="lg" weight="semibold" />
              <UText :label="$t('description.star')" variant="lifted" class="leading-normal" />
            </UCol>
          </URow>
        </UCard>
      </ULink>
    </URow>
  </UCol>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useWelcomePageStore } from "../store";

import VuelessOuter from "../../../assets/images/vueless-logo-outer.svg?component";
import VuelessInner from "../../../assets/images/vueless-logo-inner.svg?component";

const welcomePageStore = useWelcomePageStore();

const { version } = storeToRefs(welcomePageStore);

onMounted(async () => {
  await welcomePageStore.getVuelessVersion();
});
</script>
