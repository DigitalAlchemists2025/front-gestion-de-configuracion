/* 
    Función para transformar datos en el modal de la vista Historial
*/

export function getChangeDetails(selectedRecord) {
    if (!selectedRecord) return [];

    const details = selectedRecord.details || {};
    const changes = [];

    // Procesa descripciones agregadas, editadas o eliminadas
    if (details.descriptions) {
        if (details.descriptions.added?.length) {
            changes.push({
                type: "added",
                label: "Características agregadas",
                items: details.descriptions.added.map(d => `${d.name}: ${d.description}`),
            });
        }

        if (details.descriptions.edited?.length) {
            changes.push({
                type: "edited",
                label: "Características editadas",
                items: details.descriptions.edited.map(d => {
                    const nameChanged = d.before.name !== d.after.name;
                    const descriptionChanged = d.before.description !== d.after.description;
                    if (nameChanged && descriptionChanged) {
                        return `De ${d.before.name}: ${d.before.description} a ${d.after.name}: ${d.after.description}`;
                    } else if (nameChanged) {
                        return `Nombre: De ${d.before.name} a ${d.after.name}`;
                    } else if (descriptionChanged) {
                        return `Descripción: De ${d.before.description} a ${d.after.description}`;
                    } else {
                        return `Sin cambios visibles`;
                    }
                }),
            });
        }

        if (details.descriptions.deleted?.length) {
            changes.push({
                type: "deleted",
                label: "Características eliminadas",
                items: details.descriptions.deleted.map(d => `${d.name}: ${d.description}`),
            });
        }
    }

    // Cambios de nombre, tipo o estado del componente principal
    for (const key in details) {
        const change = details[key];
        if (
            change &&
            typeof change === 'object' &&
            'before' in change &&
            'after' in change &&
            !['descriptions'].includes(key)
        ) {
            changes.push({
                type: "edited",
                label: `Cambio en ${key}`,
                items: [`De "${change.before}" a "${change.after}"`],
            });
        }
    }
    // Asociar/desasociar subcomponentes
    if (selectedRecord.action?.toLowerCase() === "asociar subcomponente") {
        changes.push({
            type: "associated",
            label: "Subcomponente asociado",
            items: [
                `${selectedRecord.subcomponent_type}: ${selectedRecord.subcomponent_name}`,
            ],
        });
    }

    if (selectedRecord.action?.toLowerCase() === "desasociar subcomponente") {
        changes.push({
            type: "disassociated",
            label: "Subcomponente desasociado",
            items: [
                `${selectedRecord.subcomponent_type}: ${selectedRecord.subcomponent_name}`,
            ],
        });
    }

    return changes;
}