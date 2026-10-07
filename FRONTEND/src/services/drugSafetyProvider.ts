// Phase 8: Prescription Clinical Safety, Allergy & Drug Interaction Knowledge Provider
import { DrugSafetyWarning, DrugSafetyEvent, WarningSeverity } from '../types';
import { dbService } from './mockDatabase';

interface KnownInteractionRule {
  drugA: string;
  drugB: string;
  severity: WarningSeverity;
  reason: string;
  recommendation: string;
}

interface AllergyRule {
  allergenKey: string; // e.g. "penicillin"
  medicationMatch: string[]; // e.g. ["amoxicillin", "ampicillin", "augmentin", "penicillin"]
  severity: WarningSeverity;
  reason: string;
}

export class DrugSafetyProvider {
  // Known clinical interaction rules (evidence-based reference database abstraction)
  private static interactionRules: KnownInteractionRule[] = [
    {
      drugA: 'warfarin',
      drugB: 'aspirin',
      severity: 'Critical',
      reason: 'Concurrent use markedly elevates hemorrhage and gastrointestinal bleeding risk.',
      recommendation: 'Avoid combination unless strictly monitored for INR with gastroprotective therapy.',
    },
    {
      drugA: 'ciprofloxacin',
      drugB: 'theophylline',
      severity: 'High',
      reason: 'Inhibition of theophylline metabolism leads to potentially toxic serum theophylline levels.',
      recommendation: 'Monitor serum theophylline concentrations or choose an alternative antibacterial.',
    },
    {
      drugA: 'methotrexate',
      drugB: 'ibuprofen',
      severity: 'Critical',
      reason: 'NSAIDs reduce renal methotrexate clearance causing acute bone marrow suppression and hepatotoxicity.',
      recommendation: 'Avoid concurrent NSAIDs with high-dose methotrexate; consider paracetamol for analgesia.',
    },
    {
      drugA: 'lisinopril',
      drugB: 'spironolactone',
      severity: 'High',
      reason: 'Synergistic potassium retention may trigger life-threatening hyperkalemia.',
      recommendation: 'Closely monitor serum potassium and creatinine within 1-2 weeks of initiation.',
    },
    {
      drugA: 'metformin',
      drugB: 'iodinated contrast',
      severity: 'High',
      reason: 'Risk of lactic acidosis if acute renal impairment occurs during contrast administration.',
      recommendation: 'Withhold metformin 48 hours prior to and post iodinated contrast imaging.',
    },
    {
      drugA: 'atorvastatin',
      drugB: 'clarithromycin',
      severity: 'Warning',
      reason: 'CYP3A4 inhibition elevates statin plasma concentration, increasing rhabdomyolysis risk.',
      recommendation: 'Temporarily suspend atorvastatin during the course of macrolide antibiotic.',
    },
    {
      drugA: 'sildenafil',
      drugB: 'nitroglycerin',
      severity: 'Critical',
      reason: 'Severe synergistic vasodilation causing refractory hypotension and cardiovascular collapse.',
      recommendation: 'Absolute contraindication. Do not co-administer nitrates with PDE-5 inhibitors.',
    },
  ];

  // Documented Allergy Groups
  private static allergyRules: AllergyRule[] = [
    {
      allergenKey: 'penicillin',
      medicationMatch: ['penicillin', 'amoxicillin', 'ampicillin', 'augmentin', 'piperacillin'],
      severity: 'Critical',
      reason: 'Patient has a documented hypersensitivity to Penicillins. Risk of anaphylaxis or angioedema.',
    },
    {
      allergenKey: 'sulfa',
      medicationMatch: ['sulfamethoxazole', 'bactrim', 'septra', 'sulfasalazine'],
      severity: 'High',
      reason: 'Patient has a documented Sulfonamide allergy. Risk of Stevens-Johnson syndrome or severe rash.',
    },
    {
      allergenKey: 'aspirin',
      medicationMatch: ['aspirin', 'acetylsalicylic acid', 'ibuprofen', 'naproxen', 'diclofenac'],
      severity: 'High',
      reason: 'Documented NSAID / Aspirin intolerance. Potential bronchospasm or urticaria.',
    },
    {
      allergenKey: 'codeine',
      medicationMatch: ['codeine', 'tramadol', 'morphine'],
      severity: 'Warning',
      reason: 'Documented Opioid / Codeine adverse hypersensitivity.',
    },
    {
      allergenKey: 'contrast',
      medicationMatch: ['iohexol', 'iodine', 'radiocontrast'],
      severity: 'High',
      reason: 'Documented Radiopaque iodinated contrast reaction.',
    },
  ];

  /**
   * Check a proposed medication against patient allergies and other medications
   */
  public static evaluatePrescriptionSafety(params: {
    patientId: string;
    medicineName: string;
    currentMedications?: string[];
    otherItemsInPrescription?: string[];
  }): DrugSafetyWarning[] {
    const warnings: DrugSafetyWarning[] = [];
    const patient = dbService.getPatientById(params.patientId);
    const medLower = params.medicineName.toLowerCase();

    // 1. Check Allergies
    if (patient && patient.allergies && patient.allergies.length > 0) {
      for (const allergy of patient.allergies) {
        const allergyLower = allergy.toLowerCase();
        for (const rule of this.allergyRules) {
          if (allergyLower.includes(rule.allergenKey)) {
            const matchesMed = rule.medicationMatch.some(m => medLower.includes(m));
            if (matchesMed) {
              warnings.push({
                id: `warn-all-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                medicineName: params.medicineName,
                warningType: 'ALLERGY',
                severity: rule.severity,
                reason: `${rule.reason} (Patient allergy: "${allergy}")`,
                relatedMedicationOrAllergen: allergy,
                recommendation: 'Select alternative pharmacological class without cross-reactivity.',
                isDismissed: false,
                isOverridden: false,
              });
            }
          }
        }
      }
    }

    // 2. Check Drug-Drug Interactions
    const combinedMedList = [
      ...(params.currentMedications || []),
      ...(params.otherItemsInPrescription || []),
    ];

    for (const otherMed of combinedMedList) {
      const otherLower = otherMed.toLowerCase();
      if (otherLower === medLower) {
        warnings.push({
          id: `warn-dup-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          medicineName: params.medicineName,
          warningType: 'DUPLICATE_THERAPY',
          severity: 'Warning',
          reason: `Duplicate medication entry: ${params.medicineName} is already prescribed in this plan.`,
          relatedMedicationOrAllergen: otherMed,
          recommendation: 'Review dosage frequency or consolidate single prescription item.',
          isDismissed: false,
          isOverridden: false,
        });
        continue;
      }

      for (const rule of this.interactionRules) {
        const matchPair1 = medLower.includes(rule.drugA) && otherLower.includes(rule.drugB);
        const matchPair2 = medLower.includes(rule.drugB) && otherLower.includes(rule.drugA);

        if (matchPair1 || matchPair2) {
          warnings.push({
            id: `warn-int-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            medicineName: params.medicineName,
            warningType: 'INTERACTION',
            severity: rule.severity,
            reason: `${rule.reason} (Interacts with: "${otherMed}")`,
            relatedMedicationOrAllergen: otherMed,
            recommendation: rule.recommendation,
            isDismissed: false,
            isOverridden: false,
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Log Clinical Safety Audit Event
   */
  public static logSafetyEvent(event: Omit<DrugSafetyEvent, 'id' | 'timestamp'>): DrugSafetyEvent {
    const safetyEvent: DrugSafetyEvent = {
      ...event,
      id: `safe-evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    dbService.addDrugSafetyEvent(safetyEvent);
    return safetyEvent;
  }
}
