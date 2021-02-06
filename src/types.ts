import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
declare global {
  interface HTMLElementTagNameMap {
    'linak-desk-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
  interface Window {
    customCards?: { 
      type: string;
      description: string;
      name: string; 
      preview?: boolean;
    }[];
  }
}

export interface LinakDeskCardConfig extends LovelaceCardConfig {
  name?: string;
  entity: string;
  maxHeight: string;
  minHeight: string;
  presets: {
    target: number;
    label: string;
  }[];
}
