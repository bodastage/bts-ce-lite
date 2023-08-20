/*
Copyright 2023 Bodastage Solutions Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
#include <napi.h>
#include <iostream>
#include <map>
#include "stack"
#include <fstream>
#include <chrono>

//Logging
#include "spdlog/spdlog.h"
#include "spdlog/cfg/env.h"  // support for loading levels from the environment variable
#include "spdlog/fmt/ostr.h" // support for user defined types

using namespace std;

namespace bodastage
{
    /**
     * @brief parse input file or directory into output directory
     * 
     * @param input_file char* input file or directory
     * @param output_dir char* output directory
     * @param multivalue_sep char* multivalue separator. defailt is ";"
     * @param meta_fields char* meta fields. FILENAME,DATETIME
     * @param extract_parametes char* specify parameter to extract parameters. default is ""
     * @param separate_vsdata bool separate vsdata. default is false
    */
    int parse_bulkcm(string input_file, string output_dir, string multivalue_sep = ";", string meta_fields = "", string extract_parametes = "", bool separate_vsdata = false);

    // parse_bulkcm function wrapper
    /**
     * @brief
     * 
    */
    Napi::Boolean parse_bulkcm_wrapper(const Napi::CallbackInfo &info);

    // Export API
    Napi::Object Init(Napi::Env env, Napi::Object exports);

    NODE_API_MODULE(addon, Init)
}