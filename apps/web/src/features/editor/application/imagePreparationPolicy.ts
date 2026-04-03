export const IMAGE_PREPARATION_VERSION = 1

export type ImagePreparationPolicyConfig = {
  zoomBudget: number
  minimumWorkingSize: number
  globalMaxWorkingSize: number
  effectiveDprCap: number
  upgradeThresholdMultiplier: number
}

export type CalculateWorkingImageTargetInput = {
  cellLongestSide: number
  originalLongestSide: number
  devicePixelRatio?: number
  zoomBudget?: number
  config?: Partial<ImagePreparationPolicyConfig>
}

export type WorkingImageTarget = {
  effectiveDpr: number
  zoomBudget: number
  baseTarget: number
  targetLongestSide: number
}

export const defaultImagePreparationPolicyConfig: ImagePreparationPolicyConfig = {
  zoomBudget: 2,
  minimumWorkingSize: 384,
  globalMaxWorkingSize: 1600,
  effectiveDprCap: 2,
  upgradeThresholdMultiplier: 1.3,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function round(value: number) {
  return Math.round(value)
}

export function resolveImagePreparationPolicyConfig(
  overrides?: Partial<ImagePreparationPolicyConfig>
): ImagePreparationPolicyConfig {
  return {
    ...defaultImagePreparationPolicyConfig,
    ...overrides,
  }
}

export function getEffectiveDevicePixelRatio(
  devicePixelRatio: number | undefined,
  config?: Partial<ImagePreparationPolicyConfig>
) {
  const resolvedConfig = resolveImagePreparationPolicyConfig(config)
  const safeDpr =
    typeof devicePixelRatio === 'number' && Number.isFinite(devicePixelRatio)
      ? devicePixelRatio
      : 1

  return clamp(safeDpr, 1, resolvedConfig.effectiveDprCap)
}

export function calculateWorkingImageTarget(
  input: CalculateWorkingImageTargetInput
): WorkingImageTarget {
  const config = resolveImagePreparationPolicyConfig(input.config)
  const effectiveDpr = getEffectiveDevicePixelRatio(input.devicePixelRatio, config)
  const zoomBudget = Math.max(input.zoomBudget ?? config.zoomBudget, 1)
  const cellLongestSide = Math.max(input.cellLongestSide, 0)
  const originalLongestSide = Math.max(input.originalLongestSide, 1)
  const baseTarget = cellLongestSide * effectiveDpr * zoomBudget
  const clampedTarget = clamp(
    baseTarget,
    config.minimumWorkingSize,
    config.globalMaxWorkingSize
  )

  return {
    effectiveDpr,
    zoomBudget,
    baseTarget,
    targetLongestSide: round(Math.min(clampedTarget, originalLongestSide)),
  }
}
