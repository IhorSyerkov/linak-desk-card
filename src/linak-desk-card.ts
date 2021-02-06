/* eslint-disable @typescript-eslint/camelcase */
import {
  LitElement,
  html,
  customElement,
  property,
  CSSResult,
  TemplateResult,
  css,
  PropertyValues,
  internalProperty,
} from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  LovelaceCardEditor,
  getLovelace,
  fireEvent,
} from 'custom-card-helpers';

import './editor';

import type { LinakDeskCardConfig } from './types';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';
import { HassEntity } from 'home-assistant-js-websocket';
import tableBottomImg from './table_bottom.png';
import tableMiddleImg from './table_middle.png';
import tableTopImg from './table_top.png';

/* eslint no-console: 0 */
console.info(
  `%c  LINAK-DESK-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

window.customCards = window.customCards || [];
window.customCards.push({
  preview: true,
  type: 'linak-desk-card',
  name: 'LinakDesk Card',
  description: 'A template custom card for you to create something awesome',
});

@customElement('linak-desk-card')
export class LinakDeskCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('linak-desk-card-editor');
  }

  public static getStubConfig(_, entities): Partial<LinakDeskCardConfig> {
      const [entity] = entities.filter((eid) => eid.substr(0, eid.indexOf('.')) === 'cover' && eid.includes('desk'));
    return {
      entity,
      presets: []
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private config!: LinakDeskCardConfig;

  private targetHeight = 0;

  public setConfig(config: LinakDeskCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'LinakDesk',
      ...config,
    };
    // this.targetHeight = config.minHeight;
  }

  get entity(): HassEntity {
    return this.hass.states[this.config.entity]
  }

  // get alpha(): number {
    // return (this.targetHeight - this.config.minHeight) / (this.config.maxHeight - this.config.minHeight)
  // }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    return html`
      <ha-card .label=${`LinakDesk: ${this.config.entity || 'No Entity Defined'}`}>
        <div class="preview">
          <img src="${tableTopImg}" style="transform: translateY(${this.calculateOffset(90)}px);" />
          <img src="${tableMiddleImg}" style="transform: translateY(${this.calculateOffset(60)}px);" />
          <img src="${tableBottomImg}" />
          <div class="height" style="transform: translateY(${this.calculateOffset(90)}px);">
            ${this.targetHeight}
            <span>cm</span>
          </div>
          <div class="knob">
            <div class="knob-button" 
                  @touchstart='${this.goUp}' 
                  @mousedown='${this.goUp}' 
                  @mouseout=${this.stop}
                  @touchend='${this.stop}'
                  @mouseup='${this.stop}'>
              <ha-icon icon="mdi:chevron-up"></ha-icon>
            </div>
            <div class="knob-button" 
                  @touchstart=${this.goDown} 
                  @mousedown=${this.goDown} 
                  @mouseout=${this.stop}
                  @touchend=${this.stop}
                  @mouseup=${this.stop}>
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </div>
          </div>
          <paper-icon-button icon="hass:dots-vertical" @click='${this.handleMore}' />
          <div class="presets-container">
            ${this.renderPresets()}
          </div>
        </div>
      </ha-card>
    `;
  }

  calculateOffset(maxValue) {
    return Math.round(maxValue * (1.0))
  }

  renderPresets(): TemplateResult {
    const presets = this.config.presets || [];
    // const selected = presets.find((target) => target == this.targetHeight)

    return html`
        <div class="presets">
          ${presets.map(item => html`
            <paper-button @click="${() => this.handlePreset(item)}">
              ${item.label} - ${item.target}
            </paper-button>`)} 
        </div>
      `;
  }

  handlePreset(preset): void {
    const position = parseInt(preset.target, 10);
    if (!isNaN(position)) {
      this.callService('set_cover_position', { position });
      this.targetHeight = position;
    }
  }

  private goUp(): void {
    this.callService('open_cover');
  }

  private goDown(): void {
    this.callService('close_cover');
  }

  private stop(): void {
    this.callService('stop_cover');
  }

  private callService(service, options = {}): void {
    this.hass.callService('cover', service, {
      entity_id: this.config.entity,
      ...options
    });
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  private handleMore(): void {
    fireEvent(this, 'hass-more-info', {entityId: this.config.entity_id}, { bubbles: true, composed: true });
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: flex;
        flex: 1;
        flex-direction: column;
      }
      ha-card {
        flex-direction: column;
        flex: 1;
        position: relative;
        padding: 0px;
        border-radius: 4px;
        overflow: hidden;
      }
      .preview {
        background: linear-gradient(to bottom, var(--primary-color), var(--dark-primary-color));
        overflow: hidden;
        position: relative;
        min-height: 365px;
      }
      .preview img {
        position: absolute;
        bottom: 0px;
        transition: all 0.2s linear;
      }
      .preview .knob {
        background: #fff;
        position: absolute;
        display: flex;
        flex-direction: column;
        left: 25px;
        bottom: 25px;
        border-radius: 35px;
        width: 50px;
        overflow: hidden;
        height: 140px;
        box-shadow: 0px 0px 36px darkslategrey;
      }
      .preview .knob .knob-button {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
      }
      .preview .knob .knob-button ha-icon {
        color: #030303;
      }
      .preview .knob .knob-button:active {
        background: rgba(0, 0, 0, 0.06);
      }
      .height {
        position: absolute;
        left: 30px;
        top: 60px;
        font-size: 32px;
        font-weight: bold;
        transition: all 0.2s linear;
      }
      .height span {
        opacity: 0.6;
      }
      .presets {
        position: absolute;
        display: flex;
        flex-direction: column;
        width: 60px;
        right: 25px;
        top: 25px;
      }

      .presets > paper-button {
        height: 35px;
        margin-bottom: 5px;
        background-color: white;
        border-radius: 17px;
        box-shadow: 0px 0px 36px darkslategrey;
      }

    `;
  }
}
