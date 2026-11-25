<?php

$dataDirectory = dirname(base_path()).DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR;

return [
    'questions_path' => $dataDirectory.'questions.json',
    'series_path' => $dataDirectory.'series_filieres.json',
    'fields_path' => $dataDirectory.'filieres.json',
];
