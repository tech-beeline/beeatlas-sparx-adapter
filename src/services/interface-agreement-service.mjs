import IARepository from '../utils/ia.mjs'

class IAService {
    async getIARawContent(path) {
        const ia = await IARepository.Instance.byPath(path);
        if (ia) return ia.raw;
        return null;
    }
}

export default new IAService();