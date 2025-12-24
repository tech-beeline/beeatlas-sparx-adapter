import { BadRequest, NotImplemented } from "../../../../utils/errors.mjs";
import eaRepository from "../ea-repository.mjs";
import { t_object } from "../index.mjs";

async function mergeObjects(targetId, sourceId, deleteSource = false) {
    console.log(`Начато слияние элемента ${targetId} с элементом ${sourceId}`);
    if (!sourceId) throw BadRequest(`sourceId не указан`);
    if (!targetId) throw BadRequest(`targetId не указан`);

    // Перенести связи
    // Перенести методы
    // Перенести дочерние элементы
    // Перенести classifier
    // Обновить диагарммы
    // Обновить теги
    // Обновить t_xref

    NotImplemented();
    console.log(`Слияние элемента ${targetId} с элементом ${sourceId} завершено`);
    if (deleteSource)
        eaRepository.delete(t_object, { object_id: sourceId });
}