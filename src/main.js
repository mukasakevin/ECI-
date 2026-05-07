const questionsData = {
    entrepreneur: [
        {
            title: "Section 1 : Statut juridique de l’entreprise",
            questions: [
                "L’entreprise est légalement enregistrée",
                "Numéro d’identification disponible",
                "Numéro RCCM valide",
                "Numéro d’impôt disponible"
            ]
        },
        {
            title: "Section 2 : Secteur d’activité et alignement",
            questions: [
                "Autonomisation des femmes",
                "Développement économique local"
            ]
        },
        {
            title: "Section 3 : Taille et classification de l’entreprise",
            questions: [
                "Moins de 10 employés",
                "10 employés ou plus",
                "Chiffre d’affaires < 5000 USD",
                "Chiffre d’affaires > 5000 USD"
            ],
            type: "classification"
        },
        {
            title: "Section 4 : Localisation géographique",
            questions: [
                "Projet à Goma",
                "Projet à Bukavu",
                "Autre localisation (à préciser)"
            ]
        },
        {
            title: "Section 5 : Objectifs de la subvention",
            questions: [
                "Recherche",
                "Développement",
                "Innovation",
                "Création d’emplois",
                "Croissance économique"
            ]
        },
        {
            title: "Section 6 : Plan d’affaires",
            questions: [
                "Plan d’affaires disponible",
                "Modèle économique clair",
                "Stratégie de croissance définie",
                "Plan financier coherent"
            ]
        }
    ],
    ong: [
        {
            title: "Section B.1 : Ressources humaines et gestion du personnel",
            questions: [
                "L’organisation dispose-t-elle d’un organigramme formel ?",
                "Les rôles et responsabilités sont-ils clairement définis ?",
                "Le personnel dispose-t-il de descriptions de poste écrites ?",
                "Existe-t-il des politiques RH formalisées ?",
                "Ces politiques s’appliquent-elles à tout le personnel ?",
                "Un système de paie officiel est-il en place ?",
                "Les obligations fiscales sur les salaires sont-elles respectées ?",
                "Les fonctions de paie et d’autorisation sont-elles séparées ?",
                "Des formations internes sont-elles régulièrement organisées ?",
                "Les employés remplissent-ils des feuilles de temps ?"
            ]
        },
        {
            title: "Section B.2 : Statut légal et gouvernance",
            questions: [
                "L’organisation est-elle légalement enregistrée en RDC ?",
                "Dispose-t-elle de statuts et règlement intérieur ?",
                "Possède-t-elle un RCCM et un numéro fiscal ?",
                "Est-elle autorisée à recevoir des financements ?",
                "Dispose-t-elle d’un plan stratégique ?",
                "Est-elle enregistrée auprès des autorités sectorielles (ex : agriculture) ?",
                "Bénéficie-t-elle d’une exonération fiscale ?",
                "Les règles de gouvernance (CA, rémunérations) sont-elles claires ?"
            ]
        },
        {
            title: "Section B.3 : Gestion financière et bancaire",
            questions: [
                "L’organisation dispose-t-elle d’un compte bancaire dédié ?",
                "Y a-t-il au moins deux signataires ?",
                "Les rôles (encaissement, autorisation, paiement) sont-ils séparés ?",
                "Les rapprochements bancaires sont-ils effectués régulièrement ?",
                "Les paiements sont-ils majoritairement effectués via banque ?",
                "Un système de petite caisse est-il en place et contrôlé ?",
                "Des contrôles internes (vérifications inopinées) sont-ils réalisés ?"
            ]
        },
        {
            title: "Section B.4 : Comptabilité et gestion financière",
            questions: [
                "L’organisation dispose-t-elle d’un manuel comptable ?",
                "Les comptes sont-ils tenus de manière informatisée ?",
                "Les données comptables sont-elles à jour ?",
                "Les pièces comptables sont-elles bien classées et disponibles ?",
                "Les transactions sont-elles validées par un responsable ?",
                "Des états financiers récents sont-ils disponibles ?",
                "Les dépenses sont-elles suivies par rapport au budget ?"
            ]
        },
        {
            title: "Section B.5 : Procédures d’achats et passation des marchés",
            questions: [
                "Les fonctions d’achat sont-elles séparées (commande, réception, paiement) ?",
                "Des bons de commande formels sont-ils utilisés ?",
                "Les achats sont-ils approuvés par un responsable ?",
                "Trois devis sont-ils généralement demandés ?",
                "Les choix de fournisseurs sont-ils justifiés ?",
                "Les biens reçus sont-ils vérifiés et documentés ?"
            ]
        }
    ]
};

const SecurityValidator = (() => {
    const errorMessages = {
        required: "Ce champ est obligatoire.",
        sqlInjection: "Caractères non autorisés détectés (Injections SQL bloquées).",
        invalidDate: "La date sélectionnée n'est pas valide.",
        classificationRequired: "Veuillez sélectionner une classification (Micro, Petite ou Moyenne).",
        incompleteForm: "Veuillez répondre à toutes les questions."
    };

    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"'/]/g, (s) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;', '/': '&#x2F;'
        })[s]);
    };

    const hasSQLInjection = (str) => {
        const patterns = [/SELECT\s/i, /DROP\s/i, /--/i, /UPDATE\s/i, /DELETE\s/i];
        return patterns.some(pattern => pattern.test(str));
    };

    const showError = (inputElement, message) => {
        const parent = inputElement.closest('.input-group') || inputElement.parentElement;
        removeError(inputElement);
        inputElement.classList.add('input-error');
        const err = document.createElement('span');
        err.className = 'error-message';
        err.textContent = message;
        parent.appendChild(err);
    };

    const removeError = (inputElement) => {
        inputElement.classList.remove('input-error');
        const parent = inputElement.closest('.input-group') || inputElement.parentElement;
        const existing = parent.querySelector('.error-message');
        if (existing) existing.remove();
    };

    return {
        validateConfig: (data) => {
            let isValid = true;

            // Validate Organization Name
            if (!data.orgName.trim()) {
                showError(document.getElementById('org-name'), errorMessages.required);
                isValid = false;
            } else if (hasSQLInjection(data.orgName)) {
                showError(document.getElementById('org-name'), errorMessages.sqlInjection);
                isValid = false;
            } else {
                removeError(document.getElementById('org-name'));
            }

            // Validate Responsible
            if (!data.responsible.trim()) {
                showError(document.getElementById('responsible'), errorMessages.required);
                isValid = false;
            } else {
                removeError(document.getElementById('responsible'));
            }

            // Validate Observations
            if (hasSQLInjection(data.observations)) {
                showError(document.getElementById('observations'), errorMessages.sqlInjection);
                isValid = false;
            } else {
                removeError(document.getElementById('observations'));
            }

            return isValid;
        },
        sanitizeData: (data) => {
            const sanitized = {};
            for (let key in data) {
                sanitized[key] = sanitize(data[key]);
            }
            return sanitized;
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    const formTypeSelect = document.getElementById('form-type');
    const questionsBody = document.getElementById('questions-body');
    const questionnaireTitle = document.getElementById('questionnaire-title');
    const btnEvaluate = document.getElementById('btn-evaluate');
    const btnPdf = document.getElementById('btn-pdf');
    const resultSection = document.getElementById('result-section');

    const orgInput = document.getElementById('org-name');
    const dateInput = document.getElementById('eval-date');
    const responsibleInput = document.getElementById('responsible');
    const obsInput = document.getElementById('observations');

    // Selection screen logic
    const selectionScreen = document.getElementById('selection-screen');
    const evaluationContent = document.getElementById('evaluation-content');
    const selectionBtns = document.querySelectorAll('.selection-btn');
    const btnBack = document.getElementById('btn-back');

    // Set default date
    dateInput.valueAsDate = new Date();

    selectionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            formTypeSelect.value = type;
            dateInput.valueAsDate = new Date();
            renderQuestions();
            selectionScreen.classList.add('hidden');
            evaluationContent.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    btnBack.addEventListener('click', () => {
        evaluationContent.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
        resultSection.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function renderQuestions() {
        const type = formTypeSelect.value;
        const sections = questionsData[type];

        // Update Title and Headers based on type
        if (type === 'entrepreneur') {
            questionnaireTitle.textContent = 'Annexe A : Checklist de Conformité Entrepreneurs';
        } else {
            questionnaireTitle.textContent = 'Annexe B : Checklist des Partenaires ONG (Évaluation organisationnelle et financière)';
        }

        // Headers are now the same for both
        document.querySelector('th:nth-child(2)').textContent = 'Oui';
        document.querySelector('th:nth-child(3)').textContent = 'Non';
        document.querySelector('th:nth-child(4)').textContent = 'Commentaires';

        questionsBody.innerHTML = '';
        let questionIndex = 0;

        sections.forEach((section) => {
            // Add section header row
            const headerRow = document.createElement('tr');
            headerRow.className = 'section-header-row';
            headerRow.innerHTML = `
                <td colspan="4" class="section-title-cell">${section.title}</td>
            `;
            questionsBody.appendChild(headerRow);

            // Add questions for this section
            section.questions.forEach((q) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="Critère">${q}</td>
                    <td class="col-choice" data-label="Oui"><input type="radio" name="q${questionIndex}" value="1"></td>
                    <td class="col-choice" data-label="Non"><input type="radio" name="q${questionIndex}" value="0"></td>
                    <td class="col-choice" data-label="Commentaires"><input type="text" name="comment${questionIndex}" class="comment-input" placeholder="Commentaire..."></td>
                `;
                questionsBody.appendChild(row);
                questionIndex++;
            });

            // Handle special classification section
            if (section.type === 'classification') {
                const classRow = document.createElement('tr');
                classRow.innerHTML = `
                    <td colspan="4" class="extra-info-cell">
                        <strong>Classification :</strong>
                        <label><input type="radio" name="class-pme" value="Micro"> Micro</label>
                        <label><input type="radio" name="class-pme" value="Petite"> Petite</label>
                        <label><input type="radio" name="class-pme" value="Moyenne"> Moyenne</label>
                    </td>
                `;
                questionsBody.appendChild(classRow);
            }
        });

        // Clear results when switching
        resultSection.classList.add('hidden');
    }

    formTypeSelect.addEventListener('change', renderQuestions);
    renderQuestions();

    btnEvaluate.addEventListener('click', () => {
        const type = formTypeSelect.value;
        const sections = questionsData[type];

        // 1. Validate Config & Security
        const configData = {
            orgName: orgInput.value,
            date: dateInput.value,
            responsible: responsibleInput.value,
            observations: obsInput.value
        };

        if (!SecurityValidator.validateConfig(configData)) {
            resultSection.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // 2. Validate Questions Completion
        let totalQuestionsCount = 0;
        sections.forEach(s => totalQuestionsCount += s.questions.length);

        let totalPoints = 0;
        let eligibleQuestions = 0;
        let answeredAll = true;
        const responses = [];

        for (let i = 0; i < totalQuestionsCount; i++) {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (!selected) {
                answeredAll = false;
                continue;
            }
            responses.push({ id: i, value: selected.value });
            if (selected.value === '1') {
                totalPoints += 1;
                eligibleQuestions += 1;
            } else if (selected.value === '0') {
                eligibleQuestions += 1;
            }
        }

        if (!answeredAll) {
            alert("Veuillez répondre à toutes les questions (ou cocher N/A).");
            return;
        }

        // 3. Special Validation: Classification (if entrepreneur)
        let classification = null;
        if (type === 'entrepreneur') {
            const selectedClass = document.querySelector('input[name="class-pme"]:checked');
            if (!selectedClass) {
                alert("Veuillez sélectionner une classification (Section 3).");
                return;
            }
            classification = selectedClass.value;
        }

        // 4. Calculate and Display
        const score = eligibleQuestions > 0 ? (totalPoints / eligibleQuestions) * 100 : 0;
        displayResults(score);

        // 5. Generate "Clean" JSON Object
        const finalData = {
            timestamp: new Date().toISOString(),
            evaluationType: type,
            institutionalInfo: SecurityValidator.sanitizeData(configData),
            scoring: {
                percentage: score.toFixed(2) + "%",
                points: totalPoints,
                totalEligible: eligibleQuestions
            },
            responses: responses,
            classification: classification
        };

        console.log("Evaluation Export JSON:", finalData);

        // Show success indicator
        const successBanner = document.createElement('div');
        successBanner.className = 'success-message';
        successBanner.textContent = "Évaluation validée avec succès. Données sécurisées et prêtes pour l'export.";
        resultSection.prepend(successBanner);
        setTimeout(() => {
            if (successBanner.parentElement) successBanner.remove();
        }, 5000);
    });

    function displayResults(score) {
        const scoreValue = document.getElementById('score-value');
        const statusValue = document.getElementById('status-value');
        const recommendationText = document.getElementById('recommendation-text');
        const riskBadge = document.getElementById('risk-badge');

        scoreValue.textContent = `${score.toFixed(1)}%`;
        resultSection.classList.remove('hidden');
        resultSection.style.opacity = '1';

        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth' });

        if (score > 85) {
            statusValue.textContent = "Conforme";
            recommendationText.textContent = "À financer";
            riskBadge.textContent = "Faible";
            riskBadge.className = "badge badge-low";
            statusValue.style.color = "var(--success)";
        } else if (score >= 60) {
            statusValue.textContent = "Partiellement conforme";
            recommendationText.textContent = type === 'entrepreneur' ? "À améliorer" : "À financer avec conditions";
            riskBadge.textContent = "Modéré";
            riskBadge.className = "badge badge-mod";
            statusValue.style.color = "var(--warning)";
        } else {
            statusValue.textContent = "Non conforme";
            recommendationText.textContent = "Non recommandé";
            riskBadge.textContent = "Élevé";
            riskBadge.className = "badge badge-high";
            statusValue.style.color = "var(--danger)";
        }
    }

    btnPdf.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const orgName = orgInput.value || "Non spécifié";
        const date = dateInput.value;
        const responsible = responsibleInput.value || "Non spécifié";
        const typeSelect = document.getElementById('form-type');
        const typeText = typeSelect.options[typeSelect.selectedIndex].text;
        const typeValue = typeSelect.value;
        const score = document.getElementById('score-value').textContent;
        const status = document.getElementById('status-value').textContent;
        const risk = document.getElementById('risk-badge').textContent;
        const recommendation = document.getElementById('recommendation-text').textContent;
        const observations = obsInput.value || "Aucune observation.";

        // Header
        doc.setFillColor(0, 96, 113); // #006071
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text("EASTERN CONGO INITIATIVE", 105, 20, { align: "center" });
        doc.setFontSize(14);
        doc.text("RAPPORT D'ÉVALUATION DE CONFORMITÉ", 105, 30, { align: "center" });

        // Content
        doc.setTextColor(51, 51, 51);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("Informations Générales", 20, 55);
        doc.setFont(undefined, 'normal');
        doc.text(`Organisation: ${orgName}`, 20, 65);
        doc.text(`Date: ${date}`, 20, 72);
        doc.text(`Responsable ECI: ${responsible}`, 20, 79);
        doc.text(`Type d'évaluation: ${typeText}`, 20, 86);

        doc.setDrawColor(200, 200, 200);
        doc.line(20, 95, 190, 95);

        // Results
        doc.setFont(undefined, 'bold');
        doc.text("Synthèse de l'Évaluation", 20, 110);
        doc.setFont(undefined, 'normal');
        doc.text(`Score Final: ${score}`, 20, 120);
        doc.text(`Niveau de Risque: ${risk}`, 20, 127);
        doc.text(`Statut: ${status}`, 20, 134);

        doc.setFont(undefined, 'bold');
        doc.text("Recommandation Finale:", 20, 150);
        doc.setFont(undefined, 'normal');
        doc.text(recommendation, 20, 157, { maxWidth: 170 });

        doc.setFont(undefined, 'bold');
        doc.text("Observations Générales:", 20, 175);
        doc.setFont(undefined, 'normal');
        const obsLines = doc.splitTextToSize(observations, 170);
        doc.text(obsLines, 20, 182);
        
        let yPos = 182 + (obsLines.length * 7) + 15;

        // Positive Criteria Section
        const positiveQuestions = [];
        let qIdx = 0;
        const sections = questionsData[typeValue];
        sections.forEach(section => {
            section.questions.forEach(q => {
                const checked = document.querySelector(`input[name="q${qIdx}"][value="1"]:checked`);
                if (checked) {
                    positiveQuestions.push(q);
                }
                qIdx++;
            });
        });

        if (positiveQuestions.length > 0) {
            // Check if we need a new page for the header
            if (yPos > 240) {
                doc.addPage();
                yPos = 30;
            }

            doc.setFont(undefined, 'bold');
            doc.setFontSize(14);
            doc.setTextColor(0, 96, 113);
            doc.text("Critères de Conformité Validés", 20, yPos);
            yPos += 10;
            
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.setTextColor(51, 51, 51);

            positiveQuestions.forEach(q => {
                const qLines = doc.splitTextToSize(`• ${q}`, 170);
                // Check for page overflow
                if (yPos + (qLines.length * 5) > 275) {
                    doc.addPage();
                    yPos = 30;
                }
                doc.text(qLines, 20, yPos);
                yPos += (qLines.length * 5) + 2;
            });
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: "center" });
            doc.text("Document généré automatiquement par l'Outil d'Évaluation ECI", 105, 290, { align: "center" });
        }

        doc.save(`Evaluation_ECI_${orgName.replace(/\s+/g, '_')}.pdf`);
    });
});
