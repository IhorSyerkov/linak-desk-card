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
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { LinakDeskCardConfig } from './types';
import { localize } from './localize/localize';
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

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    const covers = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'cover');
    const binarySensors = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'binary_sensor');
    const sensors = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'sensor');

    return html`
      <div class="card-config">
        <div class="option">
          <paper-input
            label=${localize('editor.name')}
            .value=${this._config.name}
            .configValue=${'name'}
            @value-changed=${this._valueChanged}
          ></paper-input>
        </div>
        <div class="option">
          <paper-dropdown-menu
            label=${localize('editor.desk')}
            @value-changed=${this._valueChanged}
            .configValue=${'desk'}
          >
            <paper-listbox slot="dropdown-content" .selected=${covers.indexOf(this._config.desk)}>
              ${covers.map(entity => {
                return html`
                  <paper-item>${entity}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class="option">
          <paper-dropdown-menu
            label=${localize('editor.height_sensor')}
            @value-changed=${this._valueChanged}
            .configValue=${'height_sensor'}
          >
            <paper-listbox slot="dropdown-content" .selected=${sensors.indexOf(this._config.height_sensor)}>
              ${sensors.map(entity => {
                return html`
                  <paper-item>${entity}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class="option">
          <paper-dropdown-menu
            label=${localize('editor.connection_sensor')}
            @value-changed=${this._valueChanged}
            .configValue=${'connection_sensor'}
          >
            <paper-listbox slot="dropdown-content" .selected=${binarySensors.indexOf(this._config.connection_sensor)}>
              ${binarySensors.map(entity => {
                return html`
                  <paper-item>${entity}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class="option">
          <paper-dropdown-menu
            label=${localize('editor.moving_sensor')}
            @value-changed=${this._valueChanged}
            .configValue=${'moving_sensor'}
          >
            <paper-listbox slot="dropdown-content" .selected=${binarySensors.indexOf(this._config.moving_sensor)}>
              ${binarySensors.map(entity => {
                return html`
                  <paper-item>${entity}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class="option">
          <paper-input
            label=${localize('editor.min_height')}
            .value=${this._config.min_height}
            auto-validate
            allowed-pattern="[0-9]"
            .configType=${'integer'}
            .configValue=${'min_height'}
            @value-changed=${this._valueChanged}
          ></paper-input>
          <paper-input
            label=${localize('editor.max_height')}
            .value=${this._config.max_height}
            auto-validate
            allowed-pattern="[0-9]"
            .configType=${'integer'}
            .configValue=${'max_height'}
            @value-changed=${this._valueChanged}
          ></paper-input>
        </div>
        <h4>${localize('editor.presets')}</h4>
        <div class="option">
          ${(this._config.presets || []).map((p, i) => html`
            <div class="preset">
              <paper-input
                .value=${p.label}
                .presetValue=${'label'}
                .presetIndex=${i}
                @value-changed=${this._presetChanged}
              ></paper-input>
              <paper-input
                .value=${p.target}
                .presetValue=${'target'}
                .presetIndex=${i}
                allowed-pattern="[0-9]"
                .configType=${'integer'}
                @value-changed=${this._presetChanged}
              ></paper-input>
              <ha-icon icon="mdi:close" .presetIndex=${i} @click=${this.removePreset}></ha-icon>  
            </div>
          `)}
          <ha-icon icon="mdi:plus" @click=${this.addPreset} ></ha-icon>  
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

  private _presetChanged({target}): void {
    const value = target.configType === 'integer' ? (parseInt(target.value) || 0) : target.value;
    this._config = {
      ...this._config,
      presets: Object.assign(
        [], 
        this._config.presets,
        { 
          [target.presetIndex]: {
            ...this._config.presets[target.presetIndex],
            [target.presetValue]: value
          }
        }
      )
    }
    this.fireConfigChangeEvent();
  }

  private fireConfigChangeEvent() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }}));
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
      this._config = {
        ...this._config,
        [target.configValue]: target.checked !== undefined 
          ? target.checked 
          : target.configType === 'integer' 
            ? (parseInt(target.value) || 0) 
            : target.value,
      };
    }
    this.fireConfigChangeEvent();
  }

  addPreset(): void {
    this._config = {
      ...this._config,
      presets: [...this._config?.presets, { label: '', target: this._config.min_height}],
    };
    this.fireConfigChangeEvent();
  }

  removePreset({ target }): void {
    this._config = {
      ...this._config,
      presets: this._config?.presets.filter((_, i) => i !== target.presetIndex),
    };
    this.fireConfigChangeEvent();
  }

  static get styles(): CSSResult {
    return css`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      paper-dropdown-menu {
        width: 100%;
      }
      .preset {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .preset > paper-input {
        margin-right: 10px;
      }
    `;
  }
}
