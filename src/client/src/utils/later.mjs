/**
 * Задержка
 * @param {number} delay Врекмя задержи в миллисекундах
 * @returns {Promise}
 */
export default function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay);
    });
}
