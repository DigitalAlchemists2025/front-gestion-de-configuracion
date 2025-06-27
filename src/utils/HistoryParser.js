export function getChangeDetails(selectedRecord) {
    if (!selectedRecord) return [];

    const details = selectedRecord.details || {};
    const changes = [];

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
                items: details.descriptions.edited.map(d => `${d.name}: ${d.description}`),
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

    if (details.nombre_anterior && details.nombre_nuevo) {
        changes.push({
            type: "edited",
            label: "Nombre cambiado",
            items: [`De "${details.nombre_anterior}" a "${details.nombre_nuevo}"`],
        });
    }

    if (details.tipo_anterior && details.tipo_nuevo) {
        changes.push({
            type: "edited",
            label: "Tipo cambiado",
            items: [`De "${details.tipo_anterior}" a "${details.tipo_nuevo}"`],
        });
    }

    if (details.estado_anterior && details.estado_nuevo) {
        changes.push({
            type: "edited",
            label: "Estado cambiado",
            items: [`De "${details.estado_anterior}" a "${details.estado_nuevo}"`],
        });
    }

    if (selectedRecord.action?.toLowerCase().includes("asociar subcomponente")) {
        changes.push({
            type: "associated",
            label: "Subcomponente asociado",
            items: [
                `Nombre: ${selectedRecord.subcomponent_name}`,
                `Tipo: ${selectedRecord.subcomponent_type}`,
            ],
        });
    }

    if (selectedRecord.action?.toLowerCase().includes("desasociar subcomponente")) {
        changes.push({
        type: "disassociated",
        label: "Subcomponente desasociado",
        items: [
            `Nombre: ${selectedRecord.subcomponent_name}`,
            `Tipo: ${selectedRecord.subcomponent_type}`,
        ],
        });
    }

    if (details.descripcion_agregada) {
        changes.push({
            type: "added",
            label: "Descripción agregada",
            items: [`ID: ${details.descripcion_agregada.$oid || details.descripcion_agregada}`],
        });
    }

    return changes;
}