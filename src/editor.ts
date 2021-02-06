/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult,
  CSSResult,
  css,
  internalProperty,
} from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { LinakDeskCardConfig } from './types';
@customElement('linak-desk-card-editor')
export class LinakDeskCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @internalProperty() private _config!: LinakDeskCardConfig;
  @internalProperty() private _helpers?: any;
  private _initialized = false;

  public setConfig(config: LinakDeskCardConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _entity(): string {
    return this._config?.entity || '';
  }
  get _minHeight() {
    return this._config?.minHeight || '';
  }

  get _maxHeight() {
    return this._config?.maxHeight || '';
  }

  get _presets() {
    return this._config?.presets || [];
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'cover');

    return html`
      <div class="card-config">
        <div class="option">
          <paper-dropdown-menu
            label="Entity (Required)"
            @value-changed=${this._valueChanged}
            .configValue=${'entity'}
          >
            <paper-listbox slot="dropdown-content" .selected=${entities.indexOf(this._entity)}>
              ${entities.map(entity => {
                return html`
                  <paper-item>${entity}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class="option">
          <paper-input
            label="Name (Optional)"
            .value=${this._name}
            .configValue=${'name'}
            @value-changed=${this._valueChanged}
          ></paper-input>
        </div>
        <div class="option">
          <paper-input
            label="Min Height"
            .value=${this._minHeight}
            .configValue=${'minHeight'}
            @value-changed=${this._valueChanged}
          ></paper-input>
          <paper-input
            label="Max Height"
            .value=${this._minHeight}
            .configValue=${'maxHeight'}
            @value-changed=${this._valueChanged}
          ></paper-input>
        </div>
        <div class="option">
          ${this._presets.map((p, i) => html`
            <div class="preset">
              <paper-input
                .value=${p}
                @value-changed=${(e) => this._presetChanged(e, i)}
              ></paper-input>
              <paper-input
                .value=${p}
                @value-changed=${(e) => this._presetChanged(e, i)}
              ></paper-input>
              <ha-icon icon="mdi:close" @click=${() => this.removePreset(i)}></ha-icon>  
            </div>
          `)}
          <ha-icon icon="mdi:plus"></ha-icon>  
        </div>
      </div>
    `;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  _presetChanged(_, i) {
    const a = i;
  }
  
  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  addPreset() {
    this._config = {
      ...this._config,
      presets: [...this._config?.presets, ''],
    };
  }

  removePreset(index) {
    this._config = {
      ...this._config,
      presets: this._config?.presets.filter((_, i) => i !== index),
    };
  }

  static get styles(): CSSResult {
    return css`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      ha-formfield {
        padding-bottom: 8px;
      }
    `;
  }
}
