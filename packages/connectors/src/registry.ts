import { Connector } from "./base";
import { GmailConnector } from "./providers/productivity/gmail";
import { NotionConnector } from "./providers/productivity/notion";
import { FitbitConnector } from "./providers/health/fitbit";
import { GarminConnector } from "./providers/health/garmin";
import { HomeAssistantConnector } from "./providers/smart-home/homeassistant";
import { MqttConnector } from "./providers/iot/mqtt";
import { OnvifConnector } from "./providers/security/onvif";

class ConnectorRegistry {
  private connectors = new Map<string, Connector>();

  constructor() {
    this.register(new GmailConnector());
    this.register(new NotionConnector());
    this.register(new FitbitConnector());
    this.register(new GarminConnector());
    this.register(new HomeAssistantConnector());
    this.register(new MqttConnector());
    this.register(new OnvifConnector());
  }

  register(connector: Connector) {
    this.connectors.set(connector.id.toLowerCase(), connector);
  }

  get(id: string): Connector | undefined {
    return this.connectors.get(id.toLowerCase());
  }

  getAll(): Connector[] {
    return Array.from(this.connectors.values());
  }
}

let registryInstance: ConnectorRegistry | null = null;

export function getConnectorRegistry(): ConnectorRegistry {
  if (!registryInstance) {
    registryInstance = new ConnectorRegistry();
  }
  return registryInstance;
}
