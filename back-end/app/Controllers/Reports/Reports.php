<?php

namespace App\Controllers\Reports;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;

class Reports extends BaseController
{
    public function create()
    {
        $errors = $this->validate_data();
        if (!empty($errors)) {
            return $this->response->setJSON([
                'status' => 'error',
                'message' => $errors,
            ])->setStatusCode(412);
        }

        $data = $this->request->getJSON(true);    
        $data['fecha'] = date('Y-m-d H:i:s');
        $data['creadoEn'] = date('U');

        $model = new \App\Models\Reports\ReportsModel();
        if ($model->insert($data)) {
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Reporte creado exitosamente.',
                'data' => $model->find($model->insertID()),
            ])->setStatusCode(200);
        }

        return $this->response->setJSON([
            'status' => 'error',
            'message' => $model->errors(),
        ])->setStatusCode(500);
    }

    public function get()
    {
        $allreports = new \App\Models\Reports\ReportsModel()->findAll();
        foreach ($allreports as &$report) {
            $report['id'] = (int)$report['id'];
            $report['creadoEn'] = (int)$report['creadoEn'];
            
            $report['creadoEn'] = gmdate("Y-m-d\TH:i:s\Z", $report['creadoEn']);
            $report['fecha'] = gmdate("Y-m-d\TH:i:s\Z", strtotime($report['fecha']));
        }

        return $this->response->setJSON($allreports)->setStatusCode(200);
    }

    public function update($id)
    {
       if(is_null($id) || empty($id)){
            return $this->response->setJSON([
                'status' => 'error',
                'message' => 'ID is required',
            ])->setStatusCode(404);
        }

        $model = new \App\Models\Reports\ReportsModel();
        $reports = $model->find($id);
        if (!$reports) {
            return $this->response->setJSON([
                'status' => 'error',
                'message' => "ReportID $id not found.",
            ])->setStatusCode(404);
        }

        $postData = $this->request->getJSON(true) ?? [];
        $data = [
            'status' => $postData['status'] ?? $reports['status'],
            'comentarios' => $postData['comentarios'] ?? $reports['comentarios'],
        ];

        if (!$model->update($id, $data)) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => $model->errors(),
            ])->setStatusCode(500);
        }

        return $this->response->setJSON($model->find($id))->setStatusCode(200);
    }

    public function delete($id)
    {
       if(is_null($id) || empty($id)){
            return $this->response->setJSON([
                'status' => 'error',
                'message' => 'ID is required',
            ])->setStatusCode(404);
        }

        $model = new \App\Models\Reports\ReportsModel();
        $reports = $model->find($id);
        if (!$reports) {
            return $this->response->setJSON([
                'status' => 'error',
                'message' => "ReportID $id not found.",
            ])->setStatusCode(404);
        }

       
        if (!$model->delete($id)) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => $model->errors(),
            ])->setStatusCode(500);
        }

        return $this->response->setStatusCode(200);
    }

    private function validate_data()
    {
        $rules = [
            'estacion' => 'required|string',
            'seccion' => 'required|string',
            'categoria' => 'required|string',
            'categoriaLabel' => 'required|string',
            'subcategoria' => 'required|string',
        ];

        return (!$this->validate($rules)) ? $this->validator->getErrors() : [];
    }
}
