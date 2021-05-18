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
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import type { LinakDeskCardConfig } from './types';
import { localize } from './localize/localize';
import { HassEntity } from 'home-assistant-js-websocket';
import tableBottomImg from './table_bottom.png';
import tableMiddleImg from './table_middle.png';
import tableTopImg from './table_top.png';
import './editor';

window.customCards = window.customCards || [];
window.customCards.push({
  preview: true,
  type: 'linak-desk-card',
  name: localize('common.name'),
  description: localize('common.description'),
});

@customElement('linak-desk-card')
export class LinakDeskCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('linak-desk-card-editor');
  }

  public static getStubConfig(_: HomeAssistant, entities: string[]): Partial<LinakDeskCardConfig> {
      const [desk] = entities.filter((eid) => eid.substr(0, eid.indexOf('.')) === 'cover' && eid.includes('desk'));
      const [height_sensor] = entities.filter((eid) => eid.substr(0, eid.indexOf('.')) === 'sensor' && eid.includes('desk_height'));
      const [moving_sensor] = entities.filter((eid) => eid.substr(0, eid.indexOf('.')) === 'binary_sensor' && eid.includes('desk_moving'));
      const [connection_sensor] = entities.filter((eid) => eid.substr(0, eid.indexOf('.')) === 'binary_sensor' && eid.includes('desk_connection'));
    return {
      desk,
      height_sensor,
      moving_sensor,
      connection_sensor,
      min_height: 62,
      max_height: 127,
      presets: []
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private config!: LinakDeskCardConfig;

  public setConfig(config: LinakDeskCardConfig): void {
    if (!config.desk || !config.height_sensor) {
      throw new Error(localize('common.desk_and_height_required'));
    }

    if (!config.min_height || !config.max_height) {
      throw new Error(localize('common.min_and_max_height_required'));
    }

    this.config = { ...config };
  }

  get desk(): HassEntity {
    return this.hass.states[this.config.desk];
  }

  get height(): number {
    return this.relativeHeight + this.config.min_height;
  }

  get relativeHeight(): number {
    return parseInt(this.hass.states[this.config.height_sensor]?.state, 10) || 0;
  }

  get connected(): boolean {
    return this.hass.states[this.config.connection_sensor]?.state === 'on';
  }

  get moving(): boolean {
    return this.hass.states[this.config.moving_sensor]?.state === 'on';
  }
  get alpha(): number {
    return (this.relativeHeight) / (this.config.max_height - this.config.min_height)
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    if (changedProps.has('config')) {
      return true;
    }

    const newHass = changedProps.get('hass') as HomeAssistant | undefined;
    if (newHass) {
      return (
        newHass.states[this.config?.desk] !== this.hass?.states[this.config?.desk]
        || newHass.states[this.config?.connection_sensor]?.state !== this.hass?.states[this.config?.connection_sensor]?.state
        || newHass.states[this.config?.height_sensor]?.state !== this.hass?.states[this.config?.height_sensor]?.state
        || newHass.states[this.config?.moving_sensor]?.state !== this.hass?.states[this.config?.moving_sensor]?.state
      );
    }
    return true;
  }

  protected render(): TemplateResult | void {
    return html`
      <ha-card .header=${this.config.name}>
        ${this.config.connection_sensor ? html`<div class="connection">
          ${localize(this.connected ? 'status.connected' : 'status.disconnected')}
          <div class="indicator ${this.connected ? 'connected' : 'disconnected'}" ></div>
        </div>` : html``}
        <div class="preview">
          <img src="${tableTopImg}" style="transform: translateY(${this.calculateOffset(90)}px);" />
          <img src="${tableMiddleImg}" style="transform: translateY(${this.calculateOffset(60)}px);" />
          <img src="${tableBottomImg}" />
          <div class="height" style="transform: translateY(${this.calculateOffset(90)}px);">
            ${this.height}
            <span>cm</span>
          </div>
          <div class="knob">
            <div class="knob-button" 
                  @touchstart='${this.goUp}' 
                  @mousedown='${this.goUp}' 
                  @touchend='${this.stop}'
                  @mouseup='${this.stop}'>
              <ha-icon icon="mdi:chevron-up"></ha-icon>
            </div>
            <div class="knob-button" 
                  @touchstart=${this.goDown} 
                  @mousedown=${this.goDown} 
                  @touchend=${this.stop}
                  @mouseup=${this.stop}>
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </div>
          </div>
          ${this.renderPresets()}
        </div>
      </ha-card>
    `;
  }

  calculateOffset(maxValue: number): number {
    return Math.round(maxValue * (1.0 - this.alpha))
  }

  renderPresets(): TemplateResult {
    const presets = this.config.presets || [];

    return html`
        <div class="presets">
          ${presets.map(item => html`
            <paper-button @click="${() => this.handlePreset(item.target)}">
              ${item.label} - ${item.target} cm
            </paper-button>`)} 
        </div>
      `;
  }

  handlePreset(target: number): void {
    if (target > this.config.max_height) {
      return;
    }

    const travelDist = this.config.max_height - this.config.min_height;
    const positionInPercent = Math.round(((target - this.config.min_height) / travelDist) * 100);

    if (Number.isInteger(positionInPercent)) {
      this.callService('set_cover_position', { position: positionInPercent });
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
      entity_id: this.config.desk,
      ...options
    });
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
        left: 20px;
        bottom: 12px;
        border-radius: 35px;
        width: 50px;
        overflow: hidden;
        height: 120px;
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
        cursor: pointer;
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
        justify-content: space-around;
        width: 36%;
        min-width: 120px;
        height: 80%;
        right: 5%;
        top: 10%;
      }

      .presets > paper-button {
        height: 40px;
        margin-bottom: 5px;
        background-color: white;
        border-radius: 20px;
        box-shadow: darkslategrey 0px 0px 36px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        color: rgb(3, 3, 3);
        font-size: 18px;
        font-weight: 500;
      }

      .connection {
        position: absolute;
        display: flex;
        align-items: center;
        right: 12px;
        top: 10px;
        color: var(--text-primary-color);
        z-index: 1;
      }

      .connection .indicator {
        margin-left: 10px;
        height: 10px;
        width: 10px;
        border-radius: 50%;
      } 

      .indicator.connected {
        background-color: green;
      }
      .indicator.disconnected {
        background-color: red;
      }
    `;
  }
}
