<template>
  <UCol justify="center" align="center" block class="bg-default lg:min-h-screen">
    <UCol align="center" gap="xl" class="lg:py-8">
      <UBadge
        size="lg"
        variant="subtle"
        color="neutral"
        round
        class="font-semibold py-1.5 text-small md:text-medium"
        :class="!version && 'animate-pulse'"
      >
        {{ $t("badge.releaseText", { version: version || "1.X.X" }) }}
      </UBadge>

      <URow align="center" gap="none" class="relative">
        <UIcon :src="VuelessOuter" alt="Vueless UI" class="size-16 mr-1" color="success" />
        <UIcon :src="VuelessInner" alt="Vueless UI" class="size-8 absolute left-6" />

        <UHeader size="2xl" class="text-nowrap">Vueless UI</UHeader>
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
      <UCard variant="outlined" class="flex items-center">
        <URow block>
          <UIcon name="docs" color="success" size="lg" />

          <UCol>
            <UChip icon="arrow_outward" size="sm">
              <ULink
                :label="$t('label.docs')"
                size="lg"
                href="https://docs.vueless.com/"
                target="blank"
                class="mr-2 font-semibold"
              />
            </UChip>

            <UText :label="$t('description.docs')" variant="lifted" />
          </UCol>
        </URow>
      </UCard>

      <UCard variant="outlined" class="flex items-center">
        <URow block>
          <UIcon name="category" color="success" size="lg" />

          <UCol>
            <UChip icon="arrow_outward" size="sm">
              <ULink
                :label="$t('label.components')"
                size="lg"
                href="https://ui.vueless.com"
                target="blank"
                class="mr-2 font-semibold"
              />
            </UChip>

            <UText :label="$t('description.components')" variant="lifted" />
          </UCol>
        </URow>
      </UCard>

      <UCard variant="outlined" class="flex items-center">
        <URow block>
          <UIcon name="star" color="success" size="lg" />

          <UCol>
            <UChip icon="arrow_outward" size="sm">
              <ULink
                :label="$t('label.star')"
                size="lg"
                href="https://github.com/vuelessjs/vueless"
                target="blank"
                class="mr-2 font-semibold"
              />
            </UChip>

            <UText :label="$t('description.star')" variant="lifted" />
          </UCol>
        </URow>
      </UCard>
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
