import { Box, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";


const SOURCE_NAME_LABEL = "Название";
const SOURCE_NAME_FIELD = "name";
const SOURCE_ID_LABEL = "Идентификатор справочника";
const SOURCE_ID_FIELD = "sourceId";

const PROMETHEUS_PROPETIES = {
    "Общее количество запросов": "prometheus-api-total-filter",
    "Успнешные запросы": "prometheus-api-success-filter",
    "Запросы, выполненные с ошибкой": "prometheus-api-error-filter",
    "Счетчик общего времени вызовов API": "prometheus-api-sum",
    "Счетчик общего количества вызовов API": "prometheus-api-count"
}

const TOTAL_QUERY_LABEL = "Общее количество запросов";
const TOTAL_QUERY_FIELD = "prometheus-api-total-filter";
const SUCCESS_QUERY_LABEL = "Количество успешных запросов";
const SUCCESS_QUERY_FIELD = "prometheus-api-success-filter";
const ERROR_QUERY_LABEL = "Количество ошибочных запросов";
const ERROR_QUERY_FIELD = "prometheus-api-error-filter";
const RESPONSE_TIME_LABEL = "Счетчик общего времени вызовов API";
const RESPONSE_TIME_FIELD = "prometheus-api-sum";
const QUERY_COUNT_LABEL = "Счетчик общего количества вызовов API";
const QUERY_COUNT_FIELD = "prometheus-api-count";

export function PrometheusProperties({ source, edit, onChange }) {

    return (
        <Box
            component={Paper}
            sx={{ margin: 1 }}>
            <TextField
                disabled={!edit}
                sx={{ margin: 1 }}
                label={SOURCE_NAME_LABEL}
                value={source.name}
                onChange={(e) => onChange?.({ ...source, name: e.target.value })}
                error={!source.name}
            />
            <TextField
                disabled={!edit}
                required
                sx={{ margin: 1 }}
                label={SOURCE_ID_LABEL}
                value={source.sourceId}
                onChange={(e) => onChange?.({ ...source, sourceId: e.target.value })}
                error={!source.sourceId}
            >
            </TextField>
            <TextField
                disabled={!edit}
                required
                fullWidth
                sx={{ margin: 1 }}
                label={TOTAL_QUERY_LABEL}
                value={source[TOTAL_QUERY_FIELD]}
                onChange={(e) => onChange?.({ ...source, [TOTAL_QUERY_FIELD]: e.target.value })}
            />
            <TextField
                disabled={!edit}
                required
                fullWidth
                sx={{ margin: 1 }}
                label={SUCCESS_QUERY_LABEL}
                value={source[SUCCESS_QUERY_FIELD]}
                onChange={(e) => onChange?.({ ...source, [SUCCESS_QUERY_FIELD]: e.target.value })}
            />
            <TextField
                disabled={!edit}
                required
                fullWidth
                sx={{ margin: 1 }}
                label={ERROR_QUERY_LABEL}
                value={source[ERROR_QUERY_FIELD]}
                onChange={(e) => onChange?.({ ...source, [ERROR_QUERY_FIELD]: e.target.value })}
            />
            <TextField
                disabled={!edit}
                fullWidth
                required
                sx={{ margin: 1 }}
                label={RESPONSE_TIME_LABEL}
                value={source[RESPONSE_TIME_FIELD]}
                onChange={(e) => onChange?.({ ...source, [RESPONSE_TIME_FIELD]: e.target.value })}
            />
            <TextField
                disabled={!edit}
                required
                fullWidth
                sx={{ margin: 1 }}
                label={QUERY_COUNT_LABEL}
                value={source[QUERY_COUNT_FIELD]}
                onChange={(e) => onChange?.({ ...source, [QUERY_COUNT_FIELD]: e.target.value })}
            />
        </Box >
    )
}