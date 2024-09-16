import { Box, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";


const SOURCE_NAME_LABEL = "Название";
const SOURCE_NAME_FIELD = "name";
const SOURCE_ID_LABEL = "Идентификатор справочника";
const SOURCE_ID_FIELD = "sourceId";


const TOTAL_QUERY_LABEL = "Общее количество запросов";
const TOTAL_QUERY_FIELD = "opensearch-api-query-total";
const SUCCESS_QUERY_LABEL = "Количество успешных запросов";
const SUCCESS_QUERY_FIELD = "opensearch-api-query-success";
const ERROR_QUERY_LABEL = "Количество ошибочных запросов";
const ERROR_QUERY_FIELD = "opensearch-api-query-error";
const RESPONSE_TIME_LABEL = "Поле, хранящее время отклика";
const RESPONSE_TIME_FIELD = "opensearch-request-time-field";


export function OpenSearchProperties({ source, edit, onChange }) {

    return (
        <Box
            component={Paper}
            sx={{ margin: 1 }}>
            
            <TextField
                value={source.name}
                label={SOURCE_NAME_LABEL}
                disabled={!edit}
                sx={{ margin: 1 }}
                onChange={(e) => onChange?.({ ...source, name: e.target.value })}
                error={!source.name || source.name === 'Новый источник'}
            />
            <TextField
                disabled={!edit}
                sx={{ margin: 1 }}
                label={SOURCE_ID_LABEL}
                value={source.sourceId}
                onChange={(e) => onChange?.({ ...source, sourceId: e.target.value })}
                error={!source.sourceId}
            />
            <TextField
                disabled={!edit}
                fullWidth
                sx={{ margin: 1 }}
                label={TOTAL_QUERY_LABEL}
                value={source[TOTAL_QUERY_FIELD]}
                onChange={(e) => onChange?.({ ...source, [TOTAL_QUERY_FIELD]: e.target.value })}
                error={!source[TOTAL_QUERY_FIELD]}
            />
            <TextField
                disabled={!edit}
                fullWidth
                sx={{ margin: 1 }}
                label={SUCCESS_QUERY_LABEL}
                value={source[SUCCESS_QUERY_FIELD]}
                onChange={(e) => onChange?.({ ...source, [SUCCESS_QUERY_FIELD]: e.target.value })}
                error={!source[SUCCESS_QUERY_FIELD]}
            />
            <TextField
                disabled={!edit}
                fullWidth
                sx={{ margin: 1 }}
                label={ERROR_QUERY_LABEL}
                value={source[ERROR_QUERY_FIELD]}
                onChange={(e) => onChange?.({ ...source, [ERROR_QUERY_FIELD]: e.target.value })}
                error={!source[ERROR_QUERY_FIELD]}
            />
            <TextField
                disabled={!edit}
                fullWidth
                sx={{ margin: 1 }}
                label={RESPONSE_TIME_LABEL}
                value={source[RESPONSE_TIME_FIELD]}
                onChange={(e) => onChange?.({ ...source, [RESPONSE_TIME_FIELD]: e.target.value })}
                error={!source[RESPONSE_TIME_FIELD]}
            />
        </Box >
    )
}