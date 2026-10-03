<?php

namespace App\Controllers;

class Home extends BaseController
{
    public function index(): string
    {
        return view('welcome_message');
    }

    public function list_of_task(): string
    {
        return "estamos en list of task"; 
    }
}
