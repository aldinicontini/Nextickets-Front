<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;

class Download extends BaseController
{
    public function index()
    {
       $filename = 'zip_back_danna.zip';
        $filePath = WRITEPATH . $filename;
        if (!file_exists($filePath)) {
            throw new \CodeIgniter\Exceptions\PageNotFoundException("El archivo no existe: " . $filename);
        }

        return $this->response->download($filePath, null)->setFileName($filename);
    }
}
