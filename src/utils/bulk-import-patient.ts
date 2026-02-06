import * as XLSX from 'xlsx';

// --- Types ---

// Le format de sortie attendu
export interface Patient {
  name: string;
  last_name: string;
  age: number;
  sex: 'H' | 'F';
  phone_number?: string;
}

export interface ImportResult {
  patients: Patient[];
  errors: string[]; // Pour savoir quelles lignes ont échoué
}

// Dictionnaire de mapping pour tolérer les variations de noms de colonnes (français/anglais/erreurs)
const COLUMN_MAPPING: Record<string, string[]> = {
  name: ['name', 'prénom', 'prenom', 'first_name', 'firstname'],
  last_name: ['last_name', 'nom', 'nom_famille', 'lastname', 'surname'],
  age: ['age', 'âge'],
  sex: ['sex', 'sexe', 'genre', 'gender'],
  phone_number: ['phone_number', 'phone', 'téléphone', 'telephone', 'tel'],
};

// --- Service ---

export class FileImportService {
  /**
   * Point d'entrée principal
   * @param buffer Le contenu du fichier (uploadé via Multer par exemple)
   */
  public parseFile(buffer: Buffer): ImportResult {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // On prend toujours la première feuille
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Conversion de la feuille en JSON brut (tableau d'objets)
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

    return this.normalizeData(rawData);
  }

  /**
   * Transforme les données brutes en format strict Patient[]
   */
  private normalizeData(rawData: Record<string, any>[]): ImportResult {
    const patients: Patient[] = [];
    const errors: string[] = [];

    rawData.forEach((row, index) => {
      try {
        const patient = this.mapRowToPatient(row);
        if (this.isValidPatient(patient)) {
          patients.push(patient);
        } else {
          errors.push(
            `Ligne ${index + 2}: Données incomplètes (Champs obligatoires manquants)`,
          );
        }
      } catch (error) {
        errors.push(
          `Ligne ${index + 2}: Erreur de formatage - ${(error as Error).message}`,
        );
      }
    });

    return { patients, errors };
  }

  /**
   * Mappe une ligne brute vers l'objet Patient en cherchant les bonnes clés
   */
  private mapRowToPatient(row: Record<string, any>): Partial<Patient> {
    // Fonction helper pour trouver la valeur quelle que soit la clé utilisée dans le CSV
    const getValue = (targetField: keyof typeof COLUMN_MAPPING) => {
      const possibleKeys = COLUMN_MAPPING[targetField];
      // On cherche la clé qui existe dans la ligne (insensible à la casse)
      const foundKey = Object.keys(row).find((key) =>
        possibleKeys.includes(key.toLowerCase().trim()),
      );
      return foundKey ? row[foundKey] : undefined;
    };

    const rawAge = getValue('age');
    const rawSex = getValue('sex');

    return {
      name: getValue('name')?.toString().trim(),
      last_name: getValue('last_name')?.toString().trim(),
      age: rawAge ? Number(rawAge) : undefined,
      sex: this.normalizeSex(rawSex),
      phone_number: getValue('phone_number')?.toString().trim(),
    };
  }

  /**
   * Normalise le sexe (H/F)
   */
  private normalizeSex(val: any): 'H' | 'F' | undefined {
    if (!val) return undefined;
    const str = val.toString().toLowerCase().trim();
    if (['h', 'm', 'homme', 'male'].includes(str)) return 'H';
    if (['f', 'femme', 'female'].includes(str)) return 'F';
    return undefined; // Ou valeur par défaut
  }

  /**
   * Validation type guard
   */
  private isValidPatient(p: Partial<Patient>): p is Patient {
    return (
      !!p.name &&
      !!p.last_name &&
      typeof p.age === 'number' &&
      !isNaN(p.age) &&
      (p.sex === 'H' || p.sex === 'F')
    );
  }
}
