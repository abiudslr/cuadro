import {
  defaultImagePreparationPolicyConfig,
  resolveImagePreparationPolicyConfig,
  type ImagePreparationPolicyConfig,
} from './imagePreparationPolicy'

export type EvaluateImageUpgradeInput = {
  requiredTargetLongestSide: number
  currentWorkingLongestSide: number
  config?: Partial<ImagePreparationPolicyConfig>
}

export type ImageUpgradeDecision = {
  shouldUpgrade: boolean
  threshold: number
}

export function evaluateImageUpgrade(
  input: EvaluateImageUpgradeInput
): ImageUpgradeDecision {
  const config = resolveImagePreparationPolicyConfig(input.config)
  const currentWorkingLongestSide = Math.max(input.currentWorkingLongestSide, 0)
  const requiredTargetLongestSide = Math.max(input.requiredTargetLongestSide, 0)
  const threshold =
    currentWorkingLongestSide *
    (config.upgradeThresholdMultiplier ??
      defaultImagePreparationPolicyConfig.upgradeThresholdMultiplier)

  return {
    shouldUpgrade: requiredTargetLongestSide > threshold,
    threshold,
  }
}
