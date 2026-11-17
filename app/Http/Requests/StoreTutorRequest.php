<?php

namespace App\Http\Requests;

use App\Models\Tutor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreTutorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Tutor::class);
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'full_name' => ['required', 'string', 'max:100'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'category_id' => ['required', 'exists:categories,id'],
            'rate' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:Active,On Leave,Inactive'],
        ];
    }
}