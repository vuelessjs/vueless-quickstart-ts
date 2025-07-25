<template>
  <UCol
    justify="center"
    align="center"
    block
    class="bg-default lg:min-h-screen"
  >
    <UCol align="center" gap="xl" class="lg:py-8">
      <UBadge
        size="lg"
        variant="subtle"
        color="neutral"
        round
        class="font-semibold py-1.5 text-small md:text-medium"
        :class="!vuelessPackage && 'animate-pulse'"
      >
        Vueless UI {{ vuelessPackage || "1.X.X" }} is out! 🚀
      </UBadge>

      <URow align="center" gap="none" class="relative">
        <UIcon
          :src="VuelessOuter"
          alt="Vueless UI"
          class="size-16 mr-1"
          color="success"
        />

        <UIcon
          :src="VuelessInner"
          alt="Vueless UI"
          class="size-8 absolute left-6"
        />

        <UHeader size="2xl" class="text-nowrap">Vueless UI</UHeader>
      </URow>

      <UText
        label="
          Create your Design System in Days, not Weeks.
          Everything You Need for Your Next Vue or Nuxt App.
        "
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
                label="Docs"
                size="lg"
                href="https://docs.vueless.com/"
                target="blank"
                class="mr-2 font-semibold"
              />
            </UChip>

            <UText
              label="Comprehensive guides, API, and usage examples."
              variant="lifted"
            />
          </UCol>
        </URow>
      </UCard>

      <UCard variant="outlined" class="flex items-center">
        <URow block>
          <UIcon name="category" color="success" size="lg" />

          <UCol>
            <UChip icon="arrow_outward" size="sm">
              <ULink
                label="Components"
                size="lg"
                href="https://ui.vueless.com"
                target="blank"
                class="mr-2 font-semibold"
              />
            </UChip>

            <UText
              label="Browse and interact with all available components."
              variant="lifted"
            />
          </UCol>
        </URow>
      </UCard>

      <UCard variant="outlined" class="flex items-center">
        <URow block>
          <UIcon name="star" color="success" size="lg" />

          <UCol>
            <UChip icon="arrow_outward" size="sm">
              <ULink
                label="Give us a star"
                size="lg"
                href="https://github.com/vuelessjs/vueless"
                target="blank"
                class="mr-2 font-semibold"
              />
            </UChip>

            <UText
              label="Support us and help others discover Vueless."
              variant="lifted"
            />
          </UCol>
        </URow>
      </UCard>
    </URow>
  </UCol>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import VuelessOuter from "../../../assets/images/vueless-logo-outer.svg?component";
import VuelessInner from "../../../assets/images/vueless-logo-inner.svg?component";

const vuelessPackage = ref<string | null>(null);

onMounted(async () => {
  const response = await fetch("https://registry.npmjs.org/vueless/latest");
  const data = await response.json();
  vuelessPackage.value = data.version;
});
</script>
