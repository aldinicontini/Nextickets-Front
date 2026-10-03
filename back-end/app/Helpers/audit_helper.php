<?php

use CodeIgniter\CodeIgniter;

if (!function_exists('audit_log')) {
    function audit_log($entity, $action, $options = [])
    {
        $db = \Config\Database::connect();

        $data = [
            'entity'            => $entity,
            'action'            => $action,
            'record_id'          => $options['record_id'] ?? null,
            'records_affected'  => $options['records'] ?? 0,
            'description'       => $options['description'] ?? null,
        ];

        try {
            $db->table('airudder.audit_log')->insert($data);
        } catch (\Exception $e) {
            // No rompemos flujo por logging
            log_message('error', 'Audit log failed: ' . $e->getMessage());
        }
    }
}