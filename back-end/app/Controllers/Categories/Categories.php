<?php

namespace App\Controllers\Categories;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;

class Categories extends BaseController
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

        $model = new \App\Models\Categories\CategoriesModel();
        if ($model->insert($data)) {
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Categoría creada exitosamente.',
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
        $allcategories = new \App\Models\Categories\CategoriesModel()->findAll();
        return $this->response->setJSON($allcategories)->setStatusCode(200);
    }

    public function update($id)
    {
       if(is_null($id) || empty($id)){
            return $this->response->setJSON([
                'status' => 'error',
                'message' => 'ID is required',
            ])->setStatusCode(404);
        }

        $model = new \App\Models\Categories\CategoriesModel();
        $categories = $model->find($id);
        if (!$categories) {
            return $this->response->setJSON([
                'status' => 'error',
                'message' => "CategoryID $id not found.",
            ])->setStatusCode(404);
        }

        $postData = $this->request->getJSON(true) ?? [];
        $data = [
            'label' => $postData['label'] ?? $categories['label'],
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

        $model = new \App\Models\Categories\CategoriesModel();
        $categories = $model->find($id);
        if (!$categories) {
            return $this->response->setJSON([
                'status' => 'error',
                'message' => "CategoryID $id not found.",
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
            'label' => 'required|string',
        ];

        return (!$this->validate($rules)) ? $this->validator->getErrors() : [];
    }
}
