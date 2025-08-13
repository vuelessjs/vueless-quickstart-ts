export interface WelcomePageStore {
  $patch: (partialState: Partial<{ version: string }>) => void;
}
