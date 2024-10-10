import { GlossariesRepository } from "../repositories/index.mjs";
import { Glossary, Term } from "../model/glossary-model.mjs";

const glossariesRepository = new GlossariesRepository();

class GlossaryService {
    /**
     * 
     * @returns {Promise<Array<Glossary>>}
     */
    async getGlossaryList() {
        const glossaries = await glossariesRepository.getGlossaries();
        return glossaries.map(g => new Glossary(g));
    }

    /**
     * 
     * @returns {Promise<Array<Glossary>>}
     */
    async getGlossary(id) {
        const glossaryData = await glossariesRepository.getGlossarById(id);
        return new Glossary(glossaryData);
    }
    /**
     * 
     * @returns {Promise<Array<Glossary>>}
     */
    async getGlossaryTerms(id) {
        const termsData = await glossariesRepository.getGlossaryTerms(id);
        return termsData.map(t => new Term(t))
    }
}

export default new GlossaryService();