#include "bodabulkcmparser.h"
#include <iostream>

bodastage::BodaBulkCmParser::~BodaBulkCmParser()
{
}

void bodastage::BodaBulkCmParser::on_start_document()
{
  std::cout << "on_start_document()" << std::endl;
}

void bodastage::BodaBulkCmParser::on_end_document()
{
  std::cout << "on_end_document()" << std::endl;
}

void bodastage::BodaBulkCmParser::on_start_element(Xml::Inspector<Xml::Encoding::Utf8Writer> inspector)
{

}

void bodastage::BodaBulkCmParser::on_end_element(Xml::Inspector<Xml::Encoding::Utf8Writer> inspector)
{
}

void bodastage::BodaBulkCmParser::on_characters(Xml::Inspector<Xml::Encoding::Utf8Writer> inspector)
{
}

void bodastage::BodaBulkCmParser::on_comment(Xml::Inspector<Xml::Encoding::Utf8Writer> inspector)
{
}