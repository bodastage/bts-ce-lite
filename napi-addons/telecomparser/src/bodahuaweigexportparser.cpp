/**

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
#include "bodahuaweigexportparser.h"
#include <iostream>
#include "fast-cpp-csv-parser/csv.h"
#include "spdlog/spdlog.h"
#include <regex>
#include <chrono>
#include <ctime>  

namespace fs = std::filesystem;

bodastage::BodaHuaweiGExportParser::BodaHuaweiGExportParser(){}

void bodastage::BodaHuaweiGExportParser::set_extract_parameters_only(bool bl){
    extract_parameters_only = bl;
}

void bodastage::BodaHuaweiGExportParser::set_extract_meta_fields(bool bl){
    extract_meta_fields = bl;
}

/**
 * @brief Extract parameter list from parameter file
 *
 * @param filename
 */
void bodastage::BodaHuaweiGExportParser::get_parameters_to_extract(string filename) {

    io::CSVReader<2, io::trim_chars<' ', '\t'>, io::no_quote_escape<':'>> in(filename);
    in.read_header(io::ignore_extra_column, "mo", "parameters");
    std::string mo; 
    std::string parameters;
    while(in.read_row(mo, parameters)){
        // do stuff with the data
        std::vector<std::string> parameter_list = bodastage::split_str(parameters, ",");
        std::vector<std::string> parameter_stack;
        for (int i = 0; i < (int)parameter_list.size(); i++) {
            parameter_stack.push_back(parameter_list[i]);
        }

        mo_columns.insert(std::pair<std::string,std::vector<string>>(mo, parameter_stack));

    }

    parser_state = EXTRACTING_VALUES;
}


/**
 * Reset some variables before parsing next file
 *
 */
void bodastage::BodaHuaweiGExportParser::reset_internal_variables() {
    tag_data.clear();
    node_type_version.clear();
    object_depth = 0;
    class_depth = 0;
}

/**
 * @brief Set parameter file
 *
 * @param filename
 */
void bodastage::BodaHuaweiGExportParser::set_parameter_file(string filename) {
    parameter_file = filename;
}


/**
 * @brief Determines if the source data file is a regular file or a directory and
 * parses it accordingly
 *
 * @since 1.1.0
 * @version 1.0.0
 */
void bodastage::BodaHuaweiGExportParser::process_file_or_directory() {

    fs::path path(data_source);

    bool is_regular_executable_file = bodastage::is_regular_file(path) && bodastage::file_is_readable(path);
    bool is_readable_directory = bodastage::is_directory(path)  && bodastage::file_is_readable(path);

    if (is_regular_executable_file) {
        set_file_name(data_source);

        base_file_name = bodastage::get_file_basename(data_file);
        if (parser_state == EXTRACTING_PARAMETERS && extract_parameters_only == false) {
            spdlog::info("Extracting parameters from {}...", base_file_name );
        } else if(parser_state == EXTRACTING_VALUES && extract_parameters_only == false) {
            spdlog::info("Parsing {} ...",  base_file_name);
        }

        spdlog::info("++++++++++++++++++++++++++++++++");
        
        //Parse file
        parse_file(data_source);

        if (parser_state == EXTRACTING_PARAMETERS && extract_parameters_only == false) {
            spdlog::info("Done.");
        } else if(parser_state == EXTRACTING_VALUES && extract_parameters_only == false) {
            spdlog::info("Done.");
        }
    }


    if (is_readable_directory) {

        //get all the files from a directory
        for (const auto & entry : fs::directory_iterator(path)){
            set_file_name(entry.path().string());

            try{
                base_file_name = bodastage::get_file_basename(data_file);
                if(parser_state == EXTRACTING_PARAMETERS && extract_parameters_only == false){
                    spdlog::info("Extracting parameters from {}...", base_file_name );
                }else{
                    spdlog::info("Parsing {} ...",  base_file_name);
                }
                
                spdlog::info("++++++++++++++++++++++++++++++++222");
                spdlog::info("file: {}", entry.path().string());
                parse_file(entry.path().string());

                if(parser_state == EXTRACTING_PARAMETERS && extract_parameters_only == false){
                    spdlog::info("Done.");
                }else{
                    spdlog::info("Done.");
                }
            }catch(std::exception e){
                spdlog::error(e.what());
                spdlog::warn("Skipping file: {} \n", base_file_name);
                reset_internal_variables();
            }
        }
    }
    
}

/**
 * @brief Parser entry point
 */
void bodastage::BodaHuaweiGExportParser::parse() {
    //Extract parameters
    if (parser_state == EXTRACTING_PARAMETERS) {
        process_file_or_directory();

        parser_state = EXTRACTING_VALUES;
    }


    //Reset variables
    reset_internal_variables();
    
    if(extract_parameters_only == true ){
        display_mos_and_parameters();
    }

    //Extracting values
    if (parser_state == EXTRACTING_VALUES) {
        process_file_or_directory();
        parser_state = EXTRACTING_DONE;
    }

    close_mo_pw_map();

    if(extract_parameters_only == false ){
        print_execution_time();
    }
}

    
/*
* @brief Print list of managed objects and their parameters 
*/
void bodastage::BodaHuaweiGExportParser::display_mos_and_parameters(){

    for (auto const& entry : mo_columns){
        string mo_name = entry.first;
        vector<string> mo_parameter_list = mo_columns.at(mo_name); //or entry.second;

        string mo_parameter_list_string = mo_name + ":";

        if( extract_meta_fields == true ){
            mo_parameter_list_string = mo_parameter_list_string + "FILENAME,DATETIME,NE_TECHNOLOGY,NE_VENDOR,NE_VERSION,NE_TYPE";
        }

        int size = mo_parameter_list.size();
        if(extract_meta_fields == true && size > 0 ){
            mo_parameter_list_string += ",";
        }

        for(int i = 0; i < size; i++){
            string param = mo_parameter_list[i];
            if( i == size-1) {
                mo_parameter_list_string += param;
            } else{
                mo_parameter_list_string += param + ",";
            }
        }
        
        spdlog::info(mo_parameter_list_string);

    }
}

/**
 * @brief The parser's entry point.
 *
 */
void bodastage::BodaHuaweiGExportParser::parse_file(string input_filename){
    
    //Extract date from timestamp
    date_time = bodastage::preg_replace(input_filename, ".*_(\\d+)\\.\\D{3}", "$1");
    date_time = bodastage::preg_replace(date_time, "(\\d{4})(\\d{2})(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1-$2-$3 $4:$5:$6");

    Xml::Inspector<Xml::Encoding::Utf8Writer> inspector(input_filename);
    base_file_name = bodastage::get_file_basename(input_filename);

    while (inspector.Inspect())
    {
        switch (inspector.GetInspected())
        {
            case Xml::Inspected::StartTag:
                on_start_element(inspector);
                break;
            case Xml::Inspected::EndTag:
                on_end_element(inspector);
                break;
            case Xml::Inspected::EmptyElementTag:
                on_empty_element(inspector);
                break;
            case Xml::Inspected::Text:
                on_characters(inspector);
                break;
            case Xml::Inspected::Comment:
                on_comment(inspector);
                break;
            default:
                // Ignore the rest of elements.
                break;
        }
    }

    if (inspector.GetErrorCode() != Xml::ErrorCode::None)
    {
        string error_msg = "";
        error_msg.append("row:" +  std::to_string(inspector.GetRow()));
        error_msg.append("colum:" +  std::to_string(inspector.GetColumn()));
       // error_msg.append("message" + inspector.GetErrorMessage());

       throw(error_msg);

    }
}

   /**
     * Handle start element event.
     *
     * @param xmlEvent
     *
     * @since 1.0.0
     * @version 1.0.0
     *
     */
void bodastage::BodaHuaweiGExportParser::on_start_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector){  

    string start_element = inspector.GetName();
    string qName = inspector.GetLocalName();
    string prefix = inspector.GetPrefix();

    if (qName == "class") {
        class_depth++;

        Xml::Inspector<Xml::Encoding::Utf8Writer>::SizeType i;
        for (i = 0; i < inspector.GetAttributesCount(); ++i){
            string attr_name = inspector.GetAttributeAt(i).Name;
            string attr_value = inspector.GetAttributeAt(i).Value;

            if (attr_name == "name") {
                class_name = bodastage::toupper(attr_value);

                std::map<string, string> lhm;

                if (class_depth == 1) {
                    node_type_version = attr_value;
                }
            }
        }
    }

    //parameter
    if (qName == "parameter") {
        string param_name;
        string param_value;

        Xml::Inspector<Xml::Encoding::Utf8Writer>::SizeType i;
        for (i = 0; i < inspector.GetAttributesCount(); ++i){
            string attr_name = inspector.GetAttributeAt(i).Name;
            string attr_value = inspector.GetAttributeAt(i).Value;

            if (attr_name == "name") {
                param_name = bodastage::toupper(attr_value);
            }

            if (attr_name == "value") {
                param_value = attr_value;
                
                //e.g MO_BTS3900 -< MO and BTS3900
                std::vector<string> mo_name_minus_ne = bodastage::split_str(class_name, "_");
                string temp_value = param_value;
                if (bodastage::preg_match(temp_value, "[^-]+-[^-]+.*")
                    &&  bodastage::value_in_vector(mo_list_without_mv_values, mo_name_minus_ne[0])
                    && param_name != "ACTION" ) {
//                    if (tempValue.matches("([^-]+-[^-]+&).*") && !paramName.equals("ACTION") ) {
//                    if (tempValue.matches("^([^-]+-[^-]+)(?:&[^-]+-[^-]+)+") && !paramName.equals("ACTION") ) {
//                    if (tempValue.matches("^([^-]+-[^-]+)(?:&[^-]+-[^-]+)+$") && !paramName.equals("ACTION")) {
                    

                    string mv_parameter = class_name + "_" + param_name;
                    std::vector<string> children;
                    
                    if( parser_state == EXTRACTING_PARAMETERS){
                        parameter_child_map.insert(std::pair<string, std::vector<string>>(mv_parameter, std::vector<string>()));
                    }
                    
                    std::vector<string> value_array = bodastage::split_str(temp_value, "&");
                    int value_array_size = value_array.size();
                    for (int j = 0; j < value_array_size; j++) {
                        string v = value_array[j];
                        std::vector<string> v_array = bodastage::split_str(v, "-");
                        string child_parameter = v_array[0];
                        string child_parameter_value = v_array[1];
                        string child =  param_name + "_" + child_parameter;
                        child = bodastage::toupper(child);
                        class_name_attrs_map.insert(std::pair(child, child_parameter_value));
                        class_name_attrs_map[child] = child_parameter_value;
                        
                        if( parser_state == EXTRACTING_PARAMETERS){
                                children.push_back(child_parameter);
                        }
                    }
                    
                    if( parser_state == EXTRACTING_PARAMETERS){
                            parameter_child_map.insert(std::pair<string, std::vector<string>>(mv_parameter, children));
                    }
                    
                }else{
                    class_name_attrs_map.insert(std::pair<string, string>(param_name, param_value));
                }
            }
        }
        return;
    }

    //object
    if (qName == "object") {
        object_depth++;

        //Get the technology, vendor and version
        if (object_depth == 1) {
            Xml::Inspector<Xml::Encoding::Utf8Writer>::SizeType i;
            for (i = 0; i < inspector.GetAttributesCount(); ++i){
                string attr_name = inspector.GetAttributeAt(i).Name;
                string attr_value = inspector.GetAttributeAt(i).Value;

                if (attr_name == "vendor") {
                    vendor = attr_value;
                }

                if (attr_name == "technique") {
                    technology = attr_value;
                }

                if (attr_name == "version") {
                    version = attr_value;
                }
            }
        }

        return;
    }
}

/**
 * @brief Handle character events.
 *
 * @param xmlEvent
 *
 * @version 1.0.0
 * @since 1.0.0
 */
void bodastage::BodaHuaweiGExportParser::on_characters(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector){
    tag_data = inspector.GetValue();
}

/**
 * @brief Processes the end tags.
 *
 * @param xmlEvent
 *
 * @since 1.0.0
 * @version 1.0.0
 * @throws FileNotFoundException
 * @throws UnsupportedEncodingException
 */
void bodastage::BodaHuaweiGExportParser::on_end_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector){
    string end_element = inspector.GetName();
    string prefix = inspector.GetPrefix();
    string qName = inspector.GetLocalName();

    if (qName == "class") {
        class_depth--;
        return;
    }

    //Extract parameters
    if(qName == "object" && parser_state == EXTRACTING_PARAMETERS && parameter_file.empty()){
        object_depth--;
        
        std::vector<string> moi_attributes;
        
        if(mo_columns.count(class_name) > 0){
            moi_attributes = mo_columns.at(class_name);
        }
        
        moi_parameter_value_map = class_name_attrs_map;
        std::map<string, string>::iterator iter; 
        for (iter = moi_parameter_value_map.begin(); iter != moi_parameter_value_map.end(); iter++){

                string parameter_name = iter->first;
                string temp_value = class_name_attrs_map.at(parameter_name);

                //e.g MO_BTS3900 -< MO and BTS3900
                std::vector<string> mo_name_minus_ne = bodastage::split_str(class_name, "_");
                
                if (bodastage::preg_match(temp_value, "[^-]+-[^-]+.*") 
                    && bodastage::value_in_vector(mo_list_without_mv_values, mo_name_minus_ne[0])
                    && parameter_name != "ACTION") {
                    string mv_parameter = class_name + "_" + parameter_name;
                    parameter_child_map.insert(std::pair<string, std::vector<string>>(mv_parameter, std::vector<string>()));
                    std::vector<string> children;

                    std::vector<string> value_array = bodastage::split_str(temp_value, "&");
                    int value_array_size = value_array.size();
                    for (int j = 0; j < value_array_size; j++) {
                        string v = value_array[j];
                        std::vector<string> v_array = bodastage::split_str(v, "-");
                        string child_parameter = v_array[0];
                        string child =  parameter_name + "_" + child_parameter;
                        child = bodastage::toupper(child);
                        if(!bodastage::value_in_vector(moi_attributes, child)){
                            moi_attributes.push_back(child);
                        }
                        children.push_back(child_parameter);
                    }
                    parameter_child_map.insert(std::pair<string, std::vector<string>>(mv_parameter, children));

                    continue;
                }

                if(!bodastage::value_in_vector(moi_attributes, parameter_name)){
                    moi_attributes.push_back(parameter_name);
                }
                
        }

        mo_columns.insert(std::pair(class_name, moi_attributes));
        
        moi_parameter_value_map.clear();
        class_name_attrs_map.clear();
        return;
    }
    
    //Extract parameter values when paramete rfile is not provided
    if (qName == "object" && parameter_file.empty()) {
        object_depth--;
        string param_names = "FILENAME,DATETIME,NE_TECHNOLOGY,NE_VENDOR,NE_VERSION,NE_TYPE";
        string param_values = base_file_name + "," + date_time + "," + technology + "," + vendor + "," + version + "," + node_type_version;

        if (moi_print_writers.count(class_name) == 0 ) {
            string moi_file = output_directory + bodastage::get_sep() + class_name + ".csv";
            moi_print_writers.insert(std::pair<string, std::ofstream>(class_name, ofstream(moi_file)));

            string p_name = param_names;

            std::vector<string> moi_attributes = mo_columns.at(class_name);
            int moi_attributes_size = moi_attributes.size();
            for (int i = 0; i < moi_attributes_size; i++) {
                string parameter_name = moi_attributes[i];
                p_name += "," + parameter_name;
            }

            moi_print_writers.at(class_name) << p_name << endl;
            //moi_print_writers.at(className).flush();
        }

        std::vector<string> moi_attributes = mo_columns.at(class_name);
        moi_parameter_value_map = class_name_attrs_map;
        int moi_attributes_size = moi_attributes.size();
        for (int i = 0; i < moi_attributes_size; i++) {
            string moi_name = moi_attributes[i];
            string mv_parameter = class_name + "_" + moi_name;

            if (moi_parameter_value_map.count(moi_name) > 0) {
                param_values += "," + bodastage::to_csv_format(moi_parameter_value_map.at(moi_name));
            } else {
                param_values += ",";
            }
        }

        moi_print_writers.at(class_name) << param_values << endl;

        moi_parameter_value_map.clear();
        class_name_attrs_map.clear();
        return;
    }
    
    //Extract values when parameter file is provided 
    if (qName == "object" && !parameter_file.empty()) {
        object_depth--;
        
        //Skip mo if it is not in the parameter file 
        //String className  = className.replaceAll("_.*$" ,"");
        
        if (mo_columns.count(class_name) > 0) return;
        
        //Get the parameter listed in the parameter file for the managed object
        std::vector<string> parameter_list  = mo_columns.at(class_name);

        string param_names = "";
        string param_values = "";

        
        //Create file if it does not already exist
        if (moi_print_writers.count(class_name) == 0) {
            string moi_file = output_directory + bodastage::get_sep() + class_name + ".csv";
            moi_print_writers.insert(std::pair<string, std::ofstream>(class_name, std::ofstream(moi_file)));

            std::vector<string> moi_attributes = mo_columns.at(class_name);
            int moi_attributes_size = moi_attributes.size();
            string p_name = param_names;
            for(int i = 0; i< moi_attributes_size; i++){
                string p = moi_attributes[i];
                p_name += "," + p;
            }
                
            p_name = bodastage::preg_replace(p_name, "^,", "");
            moi_print_writers.at(class_name) << p_name << endl;
        }

        std::vector<string> moi_attributes = mo_columns.at(class_name);
        moi_parameter_value_map = class_name_attrs_map;
        int moi_attributes_size = moi_attributes.size();
        for (int i = 0; i < moi_attributes_size; i++) {
            string moi_name = moi_attributes[i];
            string mv_parameter = class_name + "_" + moi_name;

            if (moi_parameter_value_map.count(moi_name) > 0) {
                //Handle multivalued parameters
                if (parameter_child_map.count(mv_parameter) > 0) {
                    string temp_value = moi_parameter_value_map.at(moi_name);
                    std::vector<string> value_array = bodastage::split_str(temp_value, "&");
                    int value_array_size = value_array.size();
                    for (int j = 0; j < value_array_size; j++) {
                        string v = value_array[j];
                        std::vector<string> v_array = bodastage::split_str(v, "-");
                        param_values += "," + bodastage::to_csv_format(v_array[1]);
                    }
                    continue;
                }

                param_values += "," + bodastage::to_csv_format(moi_parameter_value_map.at(moi_name));
            } else {
                
                if(moi_name == "FILENAME"){
                    param_values += "," + base_file_name;
                }else if(moi_name  == "NE_TECHNOLOGY"){
                    param_values += "," + technology;
                }else if(moi_name  == "NE_VENDOR"){
                    param_values += "," + vendor;
                }else if(moi_name == "NE_VERSION"){
                    param_values += "," + version;
                }else if(moi_name == "NE_TYPE"){
                    param_values += "," + node_type_version;
                }else if(moi_name == "DATETIME"){
                    param_values += "," + date_time;
                }else{
                    param_values += ",";
                }

            }
            
        }
        
        param_values = bodastage::preg_replace(param_values, "^,", "");
        
        moi_print_writers.at(class_name) << param_values << endl;

        moi_parameter_value_map.clear();
        class_name_attrs_map.clear();
        return;
    }
}

/**
 * @brief Print program's execution time.
 *
 * @since 1.0.0
 */
void bodastage::BodaHuaweiGExportParser::print_execution_time() {
    // std::chrono::duration<double> elapsed_seconds =  std::chrono::system_clock::now() - start_time;
    
    // float running_time = elapsed_seconds.count();
    // string s = "Parsing completed. ";
    // s = s + "Total time:";

    // //Get hours
    // if (running_time >  60 * 60) {
    //     int hrs = (int) (running_time / (1 * 60 * 60));
    //     s = s + hrs + " hours ";
    //     running_time = running_time - (hrs * 1 * 60 * 60);
    // }

    // //Get minutes
    // if (running_time > 1 * 60) {
    //     int mins = (int) (running_time / (1 * 60));
    //     s = s + mins + " minutes ";
    //     running_time = running_time - (mins * 1 * 60);
    // }

    // //Get seconds
    // if (running_time > 1) {
    //     int secs = (int) running_time;
    //     s = s + secs + " seconds ";
    //     running_time = running_time - secs;
    // }

    // //Get milliseconds
    // if (running_time > 0) {
    //     int msecs = (int) runningTime;
    //     s = s + msecs + " milliseconds ";
    //     running_time = running_time - msecs;
    // }

    // spdlog::info(s);
}

/**
 * @brief Close file print writers.
 *
 * @since 1.0.0
 * @version 1.0.0
 */
void bodastage::BodaHuaweiGExportParser::close_mo_pw_map() {
    std::map<string, ofstream>::iterator iIter; 
    for (iIter = moi_print_writers.begin(); iIter != moi_print_writers.end(); iIter++){
        iIter->second.close();
    }
    moi_print_writers.clear();
}

/**
 * Set the output directory.
 *
 * @since 1.0.0
 * @version 1.0.0
 * @param String directoryName
 */
void bodastage::BodaHuaweiGExportParser::set_output_directory(string directory_name) {
    output_directory = directory_name;
}

/**
 * @brief Set name of file to parser.
 *
 * @since 1.0.0
 * @version 1.0.0
 * @param String filename
 */
void bodastage::BodaHuaweiGExportParser::set_file_name(string filename) {
    data_file = filename;
}

/**
 * Add "U" to class name attribute value.
 *
 * @param classNameAttrValue
 *
 * @TODO: Remove nodeype from the file name.
 */
string bodastage::BodaHuaweiGExportParser::add_u_to_umts_cell_mos(string class_name_attr_value) {
    string new_mo_name = class_name_attr_value;

    if (class_depth == 1) {
        return new_mo_name;
    }

    if (technology == "WCDMA"
            && bodastage::preg_match(class_name_attr_value, "^CELL")) {
        new_mo_name = "U" + class_name_attr_value;
    }
    return new_mo_name;
}

/**
 * @brief Set name of file to parser.
 *
 * @since 1.0.1
 * @version 1.0.0
 * @param dataSource
 */
void bodastage::BodaHuaweiGExportParser::set_data_source(string ds) {
    data_source = ds;
}

/**
 * @brief Should switch parameters be split 
 * 
 * @param bool b
 */
void bodastage::BodaHuaweiGExportParser::separate_individual_switches(bool b){
    separate_switches = b;
}

void bodastage::BodaHuaweiGExportParser::on_empty_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector)
{
    on_start_element(inspector);
    on_end_element(inspector);
}