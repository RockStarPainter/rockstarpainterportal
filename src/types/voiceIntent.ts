export type VoiceIntentTarget = 'rhf' | 'state'

export type VoiceIntentSource = 'rule' | 'llm'

export interface VoiceIntentUpdate {
  target: VoiceIntentTarget
  path?: string
  key?: string
  value: unknown
  confidence: number
  source: VoiceIntentSource
}

export interface VoiceIntentResponse {
  updates: VoiceIntentUpdate[]
  meta?: {
    normalizedText?: string
    warnings?: string[]
  }
}
