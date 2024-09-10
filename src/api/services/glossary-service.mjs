import glossaryDataService from "../data/glossary-data-service.mjs";
import { Glossary, Term } from "../model/glossary-model.mjs";

class GlossaryService {
    /**
     * 
     * @returns {Promise<Array<Glossary>>}
     */
    async getGlossaryList() {
        const glossaries = await glossaryDataService.getGlossaries();
        return glossaries.map(g => new Glossary(g));
    }

    /**
     * 
     * @returns {Promise<Array<Glossary>>}
     */
    async getGlossary(id) {
        const glossaryData = await glossaryDataService.getGlossarById(id);
        return new Glossary(glossaryData);
    }
    /**
     * 
     * @returns {Promise<Array<Glossary>>}
     */
    async getGlossaryTerms(id) {
        const termsData = await glossaryDataService.getGlossaryTerms(id);
        return termsData.map(t => new Term(t))
    }
}

export default new GlossaryService();