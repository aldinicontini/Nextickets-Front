<?php

namespace App\Models;

use CodeIgniter\Model;

class RemoteBase extends Model
{
    protected $table            = 'base_20250826';
    protected $primaryKey       = 'phone_number';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields = [
        'phone_number',
        'sucursal',
        'contrato',
        'servicio_internet'
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    protected array $casts = [];
    protected array $castHandlers = [];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    private $dialerContactechs;

    public function __construct() {
        parent::__construct();
        $this->dialerContactechs = \Config\Database::connect('dialerContactechs');
    }

    public function getCustomerInformation($cell_phone) 
    {
        $builder = $this->dialerContactechs->table("cat_customers");

        $id_loads = [377,378,385,386,387];
        $result = $builder
            ->select(['no_sucursal', 'no_suscriptor', 'internet_servicio_principal', ''])
            ->where('cell_phone', $cell_phone)
            //->whereIn('id_load', $id_loads)
            ->orderBy('record_id', 'DESC')
            ->limit(1)
            ->get()
            ->getRowArray();

        if($result){
            return $result;
        } else {
            log_message('info', 'No customer informacion found for: ' . $cell_phone);
            return [];
        }
    }
}
