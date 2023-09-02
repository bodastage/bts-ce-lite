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
#include "bodautils.h"
#include "spdlog/spdlog.h"

using namespace std;

class HelloJS : public Napi::Addon<HelloJS> {
public:
    HelloJS(Napi::Env env, Napi::Object exports);
private:
    Napi::Value say_hello(const Napi::CallbackInfo& info);
};


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
    int parse_huaweimml(string input_file, string output_dir, string multivalue_sep = ";", string meta_fields = "", string extract_parametes = "");


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
    int parse_huaweigexport(string input_file, string output_dir, string multivalue_sep = ";", string meta_fields = "", string extract_parameters = "");


    // parse_bulkcm function wrapper
    /**
     * @brief
     * 
    */
    Napi::Boolean parse_bulkcm_wrapper(const Napi::CallbackInfo &info);

    // parse_bulkcm function wrapper
    /**
     * @brief
     * 
    */
    Napi::Boolean parse_huaweimml_wrapper(const Napi::CallbackInfo &info);

    // parse_huaweigexport function wrapper
    /**
     * @brief
     * 
    */
    Napi::Boolean parse_huaweigexport_wrapper(const Napi::CallbackInfo &info);

}

class TelecomParser : public Napi::Addon<TelecomParser> {
public:
    TelecomParser(Napi::Env env, Napi::Object exports);
private:
    //bulkcm
    Napi::Value parse_bulkcm(const Napi::CallbackInfo& info);

    //huawei cfgmml
    Napi::Value parse_huaweimml(const Napi::CallbackInfo& info);

    //Huawei GExport
    Napi::Value parse_huaweigexport(const Napi::CallbackInfo& info);

};