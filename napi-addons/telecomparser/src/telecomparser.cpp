#include "telecomparser.h"
#include "bodabulkcmparser.h"
#include "spdlog/spdlog.h"
#include "XmlInspector/XmlInspector.hpp"

#include <cstdlib>
#include <iostream>

using namespace std;

int bodastage::parse_bulkcm(string input_file, string output_dir, string multivalue_sep, string meta_fields, string extract_parametes, bool separate_vsdata)
{
    spdlog::info("boda-bulkcmparser 1.0.0 - {}", input_file);

    bodastage::BodaBulkCmParser parser;

    parser.set_data_source(input_file);
    parser.set_output_directory(output_dir);
    parser.set_separate_vendor_attributes(false);
    parser.parse();
   
    return 0;
}

Napi::Boolean bodastage::parse_bulkcm_wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    //@todo: validate args 

    // convert javascripts datatype to c++
    Napi::String input_file = info[0].As<Napi::String>();
    Napi::String output_dir = info[1].As<Napi::String>();

    // run c++ function return value and return it in javascript
    Napi::Boolean returnValue = Napi::Boolean::New(env, bodastage::parse_bulkcm(input_file.Utf8Value(), output_dir.Utf8Value()));

    return returnValue;
}
Napi::Object bodastage::Init(Napi::Env env, Napi::Object exports)
{
    // export Napi function
    exports.Set("parse_bulkcm", Napi::Function::New(env, bodastage::parse_bulkcm_wrapper));
    return exports;
}