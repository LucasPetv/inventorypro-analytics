import { InventoryRow, CalculatedKPIs, ColumnMapping } from '../types';

export class InventoryService {
  private static readonly API_BASE = 'http://localhost:3000'; // In Production: echte Server-URL

  /**
   * Save settings to server and get confirmation
   */
  static async saveSettings(mapping: ColumnMapping): Promise<{success: boolean, message: string, serverId?: string}> {
    try {
      // In Development: Simulation
      console.log('Saving settings to server:', mapping);
      
      // Simuliere API Call
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      // Simuliere Server-Response (90% success rate)
      if (Math.random() > 0.1) {
        const serverId = `CFG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
          success: true,
          message: `Einstellungen erfolgreich gespeichert. Server-Timestamp: ${new Date().toLocaleString()}`,
          serverId
        };
      } else {
        return {
          success: false,
          message: 'Server temporär nicht erreichbar. Bitte versuchen Sie es in wenigen Sekunden erneut.'
        };
      }
      
      /* In Production würde hier ein echter API Call stehen:
      const response = await fetch(`${this.API_BASE}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(mapping)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      */
    } catch (error) {
      console.error('Settings save error:', error);
      return {
        success: false,
        message: `Fehler beim Speichern: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      };
    }
  }

  /**
   * Upload and process data with server confirmation
   */
  static async uploadAndProcess(data: InventoryRow[]): Promise<{success: boolean, processedData?: CalculatedKPIs[], message: string}> {
    try {
      console.log(`Uploading ${data.length} rows to server for processing...`);
      
      // Simuliere Upload
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simuliere Server-Processing
      const processedData = await this.calculateAll(data);
      
      return {
        success: true,
        processedData,
        message: `${data.length} Datensätze erfolgreich verarbeitet. ${processedData.length} Ergebnisse generiert.`
      };
      
      /* In Production:
      const response = await fetch(`${this.API_BASE}/api/process-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ data })
      });
      
      return await response.json();
      */
    } catch (error) {
      console.error('Upload/process error:', error);
      return {
        success: false,
        message: `Verarbeitung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      };
    }
  }

  /**
   * Main calculation engine. In a production environment, 
   * this would be a fetch call to a secure Python/Node API.
   */
  static async calculateAll(data: InventoryRow[]): Promise<CalculatedKPIs[]> {
    // Simulate server processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    let processed = data.map(item => this.applyKPIs(item));
    processed = this.applyABC(processed);

    return processed;
  }

  private static applyKPIs(item: InventoryRow): CalculatedKPIs {
    const zinssatz = 0.05;
    
    const bestandswert = item.Istbestand * item.Preis;
    const avgLagerbestand = (item.Istbestand + item.Inventurergebnis) / 2;
    // damals wurde es wiefolgt berechnet: const umschlagshaeufigkeit = item.Verbrauch / (avgLagerbestand || 1);
    const umschlagshaeufigkeit = avgLagerbestand > 0 ? item.Verbrauch / avgLagerbestand : 0;
    // damals wurde es wiefolgt berechnet: const avgLagerdauer = 360 / (umschlagshaeufigkeit || 1);
    const avgLagerdauer = umschlagshaeufigkeit > 0 ? 360 / umschlagshaeufigkeit : 999;
    // damals wurde es wiefolgt berechnet: const kapitalbindungskosten = item.Istbestand * item.Preis * zinssatz;
    const kapitalbindungskosten = avgLagerbestand * item.Preis * zinssatz;
    const verbrauchswert = item.Verbrauch * item.Preis;

    // NEUE LAGERSTATUS-LOGIK
    let lagerStatus: 'Totes Lager' | 'Beobachten' | 'OK' = 'OK';
    let lagerStatusColor: 'red' | 'yellow' | 'green' = 'green';

    // Totes Lager: Lagerdauer > 365 Tage UND Verbrauch = 0
    if (avgLagerdauer > 364 && item.Verbrauch === 0) {
      lagerStatus = 'Totes Lager';
      lagerStatusColor = 'red';
    }
    // Beobachten: Lagerdauer > 180 Tage (aber noch Verbrauch vorhanden)
    else if (avgLagerdauer > 180) {
      lagerStatus = 'Beobachten';  
      lagerStatusColor = 'yellow';
    }

    return {
      ...item,
      bestandswert,
      avgLagerbestand,
      umschlagshaeufigkeit,
      avgLagerdauer,
      kapitalbindungskosten,
      verbrauchswert,
      abcKlasse: 'C',
      lagerStatus,
      lagerStatusColor
    };
  }

  private static applyABC(data: CalculatedKPIs[]): CalculatedKPIs[] {
    const years = [...new Set(data.map(d => d.Jahr))].sort();
    
    let finalData: CalculatedKPIs[] = [];

    years.forEach(year => {
      const yearItems = data.filter(d => d.Jahr === year);
      const sorted = [...yearItems].sort((a, b) => b.verbrauchswert - a.verbrauchswert);
      const totalVerbrauch = sorted.reduce((sum, item) => sum + item.verbrauchswert, 0);

      let runningSum = 0;
      const enriched = sorted.map(item => {
        runningSum += item.verbrauchswert;
        const kumuliert = (runningSum / (totalVerbrauch || 1)) * 100;
        let abcKlasse: 'A' | 'B' | 'C' = 'C';
        if (kumuliert <= 80) abcKlasse = 'A';
        else if (kumuliert <= 95) abcKlasse = 'B';
        
        return { ...item, abcKlasse };
      });
      finalData = [...finalData, ...enriched];
    });

    return finalData;
  }
}
