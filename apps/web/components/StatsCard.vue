<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: string
  iconBg?: string
}>()
</script>

<template>
  <div class="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
    <div class="flex items-start justify-between">
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">{{ title }}</p>
        <p class="text-2xl font-bold">{{ value }}</p>
        <div v-if="change !== undefined" class="flex items-center gap-1">
          <Icon
            v-if="trend !== 'neutral'"
            :name="trend === 'up' ? 'lucide:trending-up' : 'lucide:trending-down'"
            :class="[
              'w-4 h-4',
              trend === 'up' ? 'text-success' : 'text-destructive'
            ]"
          />
          <span
            :class="[
              'text-sm font-medium',
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
            ]"
          >
            {{ change > 0 ? '+' : '' }}{{ change }}%
          </span>
          <span class="text-xs text-muted-foreground">vs last period</span>
        </div>
      </div>
      <div
        :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center',
          iconBg || 'bg-primary/10'
        ]"
      >
        <Icon :name="icon" :class="['w-6 h-6', iconBg ? 'text-white' : 'text-primary']" />
      </div>
    </div>
  </div>
</template>
