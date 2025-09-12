import eaRepository from "../sparx-ea-repository/index.mjs";

const COLUMNS_MAP = {
    "CPB.01": {
        link: "tc_link",
        ts: "tc_ts",
        source: "tc_source"
    },
    "ADR.01": {
        link: "adr_link",
        ts: "adr_ts",
        source: "adr_source"
    },
    "CTX.01": {
        link: "context_link",
        ts: "context_ts",
        source: "context_source"
    },
    "CNT.01": {
        link: "container_link",
        ts: "container_ts",
        source: "context_source"
    },
    "TECH.01": {
        link: "techstack_link",
        ts: "techstack_ts"
    },
    "DEP.02": {
        link: "deploy_link",
        ts: "deploy_ts",
        source: "deploy_source"
    },
    "API.01": {
        link: "api_link",
        ts: "api_ts"
    },
    "SQ.01": {
        link: "sequence_link",
        ts: "sequence_ts",
        source: "sequence_source"
    },
    "API.02": {
        link: "nfr_link",
        ts: "nfr_ts"
    },
    "SEC.01": {
        link: "idm_link",
        ts: "idm_ts"
    },
}

const buildUpdateSource = (src) => src ? `${src}='FDM API', ` : "";

export class PtrArtifactsRepository {
    async setAssessmentResult(systemCode, assessmentCode, result, time) {
        const columnsMap = COLUMNS_MAP[assessmentCode];
        if (columnsMap) {
            const updateResult = await eaRepository.queryOne(
                `UPDATE fdm_ptr_artifacts SET ${columnsMap.link} = $1, ${columnsMap.ts} = $2, ${buildUpdateSource(columnsMap.source)}dt_update=NOW() WHERE cmdb_mnem=$3 RETURNING cmdb_mnem`,
                [
                    result,
                    time,
                    systemCode
                ]);
            if (!updateResult) {
                await eaRepository.queryOne(
                    `INSERT INTO fdm_ptr_artifacts(cmdb_mnem, dt_update, ${columnsMap.link}, ${columnsMap.ts} ${columnsMap.source ? `, ${columnsMap.source}` : ""}) VALUES($1,NOW(), $2, $3${columnsMap.source ? ", 'FDM API'" : ""})`,
                    [
                        systemCode, result, time
                    ])
            }
        }
    }
}